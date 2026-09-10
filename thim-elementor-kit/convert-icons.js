const fs = require( 'fs' );
const path = require( 'path' );

const srcDir = path.resolve( __dirname, 'src/libraries/thim-ekits/js' );
const buildDir = path.resolve( __dirname, 'build/libraries/thim-ekits/js' );

const selectionFile = path.join( srcDir, 'selection.json' );
const srcOutputFile = path.join( srcDir, 'thim-ekits.json' );
const srcBackupFile = path.join( srcDir, 'thim-ekits.json.bak' );
const buildOutputFile = path.join( buildDir, 'thim-ekits.json' );
const buildBackupFile = path.join( buildDir, 'thim-ekits.json.bak' );

function convertIcons() {
	if ( ! fs.existsSync( selectionFile ) ) {
		console.error( `Error: ${ selectionFile } not found!` );
		console.error( 'Please place selection.json in src/libraries/thim-ekits/js/ before running this command.' );
		process.exit( 1 );
	}

	// 1. Read and parse selection.json
	console.log( `[Reading] Reading ${ selectionFile }...` );
	const selectionData = JSON.parse( fs.readFileSync( selectionFile, 'utf8' ) );

	if ( ! selectionData.icons || ! Array.isArray( selectionData.icons ) ) {
		console.error( 'Error: Invalid selection.json format (missing icons array).' );
		process.exit( 1 );
	}

	const defaultHeight =
		selectionData.preferences &&
		selectionData.preferences.fontPref &&
		selectionData.preferences.fontPref.metrics
			? selectionData.preferences.fontPref.metrics.emSize
			: 1024;

	const icons = [];
	const svgs = {};

	selectionData.icons.forEach( ( item ) => {
		const name =
			item.properties && item.properties.name
				? item.properties.name
				: null;
		if ( ! name ) {
			return;
		}

		if ( ! icons.includes( name ) ) {
			icons.push( name );
		}

		const width = item.icon.width || defaultHeight;
		const height = defaultHeight;
		const pathData = Array.isArray( item.icon.paths )
			? item.icon.paths.join( ' ' )
			: item.icon.paths || '';
		const tags = item.icon.tags || [];

		svgs[ name ] = {
			width,
			height,
			path: pathData,
			viewBox: `0 0 ${ width } ${ height }`,
			tags,
		};
	} );
	// comment code convert svg
	// const outputData = {
	// 	icons,
	// 	svgs,
	// };

	const outputData = {
		icons,
	};
	const formattedJson = JSON.stringify( outputData, null, 2 );

	// 2. Write to src
	fs.writeFileSync( srcOutputFile, formattedJson, 'utf8' );
	console.log( `[Success] Wrote ${ icons.length } icons to ${ srcOutputFile }` );

	// 3. Write to build if build directory exists
	if ( fs.existsSync( buildDir ) ) {
		fs.writeFileSync( buildOutputFile, formattedJson, 'utf8' );
		console.log( `[Success] Synced to ${ buildOutputFile }` );
	}

	// 4. Clean up selection.json and backup files
	if ( fs.existsSync( selectionFile ) ) {
		fs.unlinkSync( selectionFile );
		console.log( `[Clean] Removed ${ selectionFile }` );
	}

	if ( fs.existsSync( srcBackupFile ) ) {
		fs.unlinkSync( srcBackupFile );
		console.log( `[Clean] Removed ${ srcBackupFile }` );
	}

	if ( fs.existsSync( buildBackupFile ) ) {
		fs.unlinkSync( buildBackupFile );
		console.log( `[Clean] Removed ${ buildBackupFile }` );
	}

	console.log( `\nAll done! Converted ${ icons.length } icons successfully.` );
}

convertIcons();
