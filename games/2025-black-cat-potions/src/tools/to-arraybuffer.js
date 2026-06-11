const filepathIn = process.argv[2];

const fs = require( 'fs' );

if( !fs.existsSync( filepathIn ) ) {
	console.error( `File does not exist: ${filepathIn}` );
	process.exit();
}

const data = fs.readFileSync( filepathIn );
console.debug( JSON.stringify( JSON.parse( JSON.stringify( data ) )?.data ) );
