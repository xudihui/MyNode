(function(){
    'use strict';
    var gulp = require('gulp'),
        connect = require('gulp-connect'),
        open = require('gulp-open'),
        less = require('gulp-less'),
        jade = require('gulp-jade'),
        rename = require('gulp-rename'),
        header = require('gulp-header'),
        md5 = require('gulp-rev'), 
        path = require('path'),
        uglify = require('gulp-uglify'),
        sourcemaps = require('gulp-sourcemaps'),
        minifyCSS = require('gulp-minify-css'),
        tap = require('gulp-tap'),
        concat = require('gulp-concat'),
        jshint = require('gulp-jshint'),
        babel = require("gulp-babel"),
        stylish = require('jshint-stylish'),
    //合并js
    gulp.task('concatJs', function (cb) {
        gulp.src(['./src/js/b.js','./src/js/a.js'])
            .pipe(concat('lib.js')) //单纯合并
            .pipe(gulp.dest('./build/js/'))
            .pipe(uglify())   //压缩代码 
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/js/min/'))   
            .on('end',function(){          //执行结束输出
               cb();
            })
    });  
    //合并js
    gulp.task('concatJs1', function (cb) {
        gulp.src(['./src/js/jweixin-1.0.0.js','./src/js/template7.min.js','./src/js/zepto.min.js','./src/js/AES.js','./src/js/main.js'])
            .pipe(concat('index.js')) //单纯合并
            .pipe(gulp.dest('./build/js/'))
            .pipe(uglify())   //压缩代码 
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/js/min/'))   
            .on('end',function(){          //执行结束输出
               cb();
            })
    });   

    gulp.task('gulp-babel', function (cb) {
       gulp.src("./src/js/app.js")
        .pipe(babel())
        .pipe(gulp.dest("./build/js/"))
        .on('end',function(){          //执行结束输出
               cb();
            })
    }); 

    gulp.task('minU', function (cb) {
        gulp.src('./src/js/u.js')
            .pipe(uglify())   //压缩代码 
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/js/min/'))   
            .on('end',function(){          //执行结束输出
               cb();
            })
    });  
    //合并js
    gulp.task('concatJs5', function (cb) {
        gulp.src(['./src/js/framework7.js','./src/js/ajax.js','./src/js/my-app.js'])
            .pipe(concat('lib.js')) //单纯合并
            .pipe(gulp.dest('./build/js/'))
            .pipe(uglify())   //压缩代码 
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/js/min/'))   
            .on('end',function(){          //执行结束输出
               cb();
            });


    });  

   gulp.task('concatJs6', function (cb) {
        gulp.src('./src/js/lib.js') 
            .pipe(uglify()) 
            .pipe(rename(function(path) { //重新命名
                path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/js/min/'))   
            .on('end',function(){          //执行结束输出
               cb();
            })
    });     


// 返回一个 callback，因此系统可以知道它什么时候完成
gulp.task('one', function(cb) {
   gulp.src(['./src/css/framework7.ios_min.css','./src/css/my-app.css','./src/css/iconfont.css'])
            .pipe(concat('lib.css'))
            .pipe(gulp.dest('./build/'))
            .pipe(minifyCSS())     //压缩输出
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))   
            .pipe(gulp.dest('./build/'))   
            .on('end',function(err){          //执行结束输出
               cb(err);
            })
            // cb(err); // 如果 err 不是 null 或 undefined，则会停止执行，且注意，这样代表执行失败了
});

// 定义一个所依赖的 task 必须在这个 task 执行之前完成
gulp.task('two', ['one'], function() {
 gulp.src(['./src/js/framework7.js','./src/js/ajax.js','./src/js/my-app.js'])
            .pipe(concat('lib.js')) //单纯合并
            .pipe(gulp.dest('./build/'))
            .pipe(uglify())   //压缩代码 
            .pipe(rename(function(path) { //重新命名
                    path.basename = path.basename + '.min';
             }))      
            .pipe(gulp.dest('./build/')) 
});

gulp.task('init', ['one', 'two']);    
var gp = gulp;
gp.task("taskName",function(){
    // 把1.js和2.js合并压缩为main.js，输出到dest/js目录下
    gp.src('./src/js/*.js').pipe(concat('main.js')).pipe(uglify()).pipe(gp.dest('./build/js'));
})


    gulp.task('baoer-uglify', function (cb) {
        gulp.src(f7.jsFiles)
            .pipe(concat('baoer.min.js'))  //简单合并文件，并生成文件名
            .pipe(uglify())                //压缩文件
            .pipe(gulp.dest('tuy'))        //输出到tuy文件夹下
            .on('end',function(){          //执行结束输出
               cb();
            })
    });   
    gulp.task('demo-jade', function (cb) {
        gulp.src('jade/*.jade')
            .pipe(jade({
                pretty: true,
                locals: {
                    stylesheetFilename: 'framework7.ios',
                    stylesheetColorsFilename: 'framework7.ios.colors',
                    scriptFilename: 'framework7',
                }
            }))
            .pipe(gulp.dest('html/'));
        cb();
    });
})();