let gulp = require("gulp");
let watch = require("gulp-watch");
let browserSync = require("browser-sync").create();
let reload = browserSync.reload;
let less = require("gulp-less");
let LessAutoprefix = require("less-plugin-autoprefix");
let cleanCss = require("gulp-clean-css");
let concat = require("gulp-concat");
let pug = require("gulp-pug");
let imagemin = require("gulp-imagemin");
let imageminJpegRecompress = require("imagemin-jpeg-recompress");
let imageminPngquant = require("imagemin-pngquant");
let runSequence = require("run-sequence");

let paths = {
	css: {
		source: ["src/less/*.less"],
		target: "src/css"
	},
	pug: {
		source: ["src/*.pug"],
		watch: ["src/**/*.pug"],
		target: ""
	},
	images: {
		source: "src/img/**/*",
		target: "img"
	}
};

let autoprefix = new LessAutoprefix({
	browsers: ["last 2 versions", "ie >= 11"]
});

let color = {
	err: "\x1b[31m%s\x1b[0m",
	warn: "\x1b[33m%s\x1b[0m",
	info: "\x1b[34m%s\x1b[0m"
};

let errorHandlers = {
	css: function(err) {
		console.log("css: ");
		err.extract.forEach(function(val) {
			console.log(color.err, val);
		});
		this.emit("end");
	},
	skip: function(err) {
		this.emit("end");
	}
};

gulp.task("browser-sync", function() {
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});
});

gulp.task("less", function() {
	let g = gulp.src(paths.css.source);
	return g
		.pipe(concat("style.min.css"))
		.pipe(less({ plugins: [autoprefix] }).on("error", errorHandlers.css))
		.pipe(cleanCss())
		.pipe(gulp.dest(paths.css.target));
});

gulp.task("pug", function buildHTML() {
	return gulp
		.src(paths.pug.source)
		.pipe(pug().on("error", errorHandlers.skip))
		.pipe(gulp.dest(paths.pug.target));
});

gulp.task("minify-images", function() {
	return gulp
		.src(paths.images.source)
		.pipe(
			imagemin(
				[
					imageminJpegRecompress({
						//jpg
						loops: 4,
						min: 60,
						max: 90,
						quality: "high"
					}),
					imageminPngquant({
						//png
						speed: 3,
						quality: 90 //lossy settings
					}),
					imagemin.svgo({
						//svg
						plugins: [
							{
								removeViewBox: false
							},
							{
								cleanupIDs: false
							},
							{
								convertStyleToAttrs: false
							}
						]
					})
				],
				{
					verbose: true
				}
			)
		)
		.pipe(gulp.dest(paths.images.target));
});

gulp.task("watch", ["less", "pug"], () => {
	watch(paths.css.source, () => {
		runSequence("less", "pug");
	}).on("change", reload);

	watch(paths.pug.watch, () => {
		gulp.start(["pug"]);
	}).on("change", reload);
});

gulp.task("default", ["browser-sync", "watch"]);

gulp.task("build", callback => {
	runSequence("less", ["pug", "minify-images"], callback);
});
