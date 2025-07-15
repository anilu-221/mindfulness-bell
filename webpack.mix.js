let mix = require('laravel-mix');

mix.js('src/app.js', 'js')
    .sass('src/app.scss', 'css')
	.copyDirectory('src/audio', 'dist/audio')
    .setPublicPath('dist')
    .options({
        processCssUrls: false,
    });