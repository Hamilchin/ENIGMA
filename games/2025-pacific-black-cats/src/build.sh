echo "minifying"
rm compo/*
rm compo.zip
cat src/indexFinal.html > temp.html
cat src/microgl.js >> temp.html
cat src/game.js >> temp.html
npx minify temp.html > compo/index.html
rm temp.html
#minify src/microgl.js > compo/microgl.js
#minify src/game.js > compo/game.js
#minify src/index.html > compo/index.html
#cp src/*.x compo
find ./src -maxdepth 1 -type f ! -name "*.*" -exec cp {} compo/ \;
#cp src_post/*.png compo
echo "compressing..."
zip -9 -X compo.zip -r compo
ls -l compo.zip
ls -l compo.zip | awk '{printf "[";n = int($5/133); for (i=1; i<=n; i++) printf "|";}'
ls -l compo.zip | awk '{m = int(($5)/133); n = int(100 - m); for (i=1; i<=n; i++) printf "."; printf "] %d%\n",m;}'
