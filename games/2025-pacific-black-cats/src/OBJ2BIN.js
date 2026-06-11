/*
File Format: (all numbers are U8, vertex are bounding box compressed)
num. vertices
range x (mapped 0..16 -> 0..255)
range y (mapped 0..16 -> 0..255)
range z (mapped 0..16 -> 0..255)
min x (mapped -16..16 -> 0..255)
min y (mapped -16..16 -> 0..255)
min z (mapped -16..16 -> 0..255)
vertices... (to reconstruct every component:  (x/255)*(rx/16)+(mx/8+16)  )
num. faces
faces...
*/
const fs = require('fs')
const filename = process.argv[2]
const output_filename = process.argv[3]
if(!filename || !output_filename)
{
    console.error("params missing: input_filename.obj output_filename.bin")
    process.exit(1)
}
const OBJFile = require('obj-file-parser');
if (!fs.existsSync(filename)) {
    console.error("file not found:",filename)
    process.exit(1)
}
const fileContents = fs.readFileSync(filename, 'utf8')
//console.log(fileContents)
console.log("Parsing...")
const objFile = new OBJFile(fileContents);
const mesh = objFile.parse(); // see description below

console.log("Converting...")
const vertices = mesh.models[0].vertices.map(v=>[v.x,v.y,v.z])
//console.dir(mesh.models[0].faces[0],{'maxArrayLength': null})
const faces = mesh.models[0].faces.map(f=>f.vertices.map(v=>v.vertexIndex))
console.log("Num. Vertices:",vertices.length)
console.log("Num. Faces:",faces.length)

//compute bounding
let min = [Infinity,Infinity,Infinity]
let max = [-Infinity,-Infinity,-Infinity]
for(let i = 0; i < vertices.length; i++)
{
    const v = vertices[i]
    for(let j=0;j<3;j++)
    {
        min[j]=Math.min(min[j],v[j])
        max[j]=Math.max(max[j],v[j])
    }
}
let range=[max[0]-min[0],max[1]-min[1],max[2]-min[2]]
console.log("MIN:",min,"MAX",max,"RANGE",range)

//check for group changes
const groups = [0,0,0,0] //to store from which face to which face is a group
let group_index = 0
let current_material = mesh.models[0].faces[0].material 
let i=0
for(; i < mesh.models[0].faces.length;i++)
{
    const face = mesh.models[0].faces[i]
    if(face.material === current_material) continue;
    groups[group_index++] = i
    current_material = face.material
}
groups[group_index] = i
console.log("Groups",groups)

//pack faces
const final_faces = new Uint8Array(faces.flat().map(i=>i-1))
//console.dir(final_faces,{'maxArrayLength': null})

//compress to bounding
const final_vertices = new Uint8Array(vertices.length*3)
for(let i = 0; i < vertices.length; i++)
{
    const v = vertices[i]
    for(let j=0;j<3;j++)
        final_vertices[i*3+j]=((v[j]-min[j])/range[j])*255
}
//console.dir(final_vertices,{'maxArrayLength': null})

const CLAMP=(a,b,c)=>Math.min(Math.max(a,b),c)
const LERP=(a,b,f)=>a*(1-f)+b*f
const ILERP=(a,b,v)=>(v-a)/(b-a)
const REMAP=(v,l1,h1,l2,h2)=>LERP(l2,h2,CLAMP(ILERP(l1,h1,v),0,1))


//pack
var data = new Uint8Array(1024*1024)
data[0]=final_vertices.length/3     //num vertices
data[1]=final_faces.length/3        //num faces
data.set(range.map(v=>REMAP(v,0,16,0,255)),2)   //bbox range
data.set(min.map(v=>REMAP(v,-16,16,0,255)),5)   //bbox min
data.set(groups,8)   //?

data.set(final_vertices,12)         //vertices
let offset=12+final_vertices.byteLength 
data.set(final_faces,offset)        //faces
offset+=final_faces.byteLength
const total_size = offset

//store
fs.writeFileSync(output_filename,data.subarray(0,total_size))

console.log("Done. From",fileContents.length,"bytes to",total_size,"bytes",Number((100-100*total_size/fileContents.length).toFixed(2)),"% reduction")


