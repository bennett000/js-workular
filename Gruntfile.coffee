# Build For: Worker, Browser, Node
#
# Make sure your system has Google's closure compiler
pathCC = '/usr/local/lib/closure-compiler'

build = require('./build.js');

module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    mkdir:
      buildEnvironement:
        options:
          create: [
            'tmp',
            'build',
            'build/browser',
            'build/worker',
            'build/node',
            'build/node/lib'
          ]

    jshint:
      workular:
        options:
          smarttabs: true
          sub: true
        files:
          src: 'src/*.js'

    copy:
      package:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'package.json'
        dest: 'build/node/'
      readme:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'README.md'
        dest: 'build/node/'

    concat:
      workular:
        src: ['src/workular.js']
        dest: 'build/node/index.js'

    'closure-compiler':
      workularWorker:
        closurePath: pathCC
        js: build.src
        jsOutputFile: 'build/worker/workular.min.js'
        maxBuffer: 500,
        noreport: true
        options:
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'
      workularNode:
        closurePath: pathCC
        js: build.src
        jsOutputFile: 'build/node/workular.min.js'
        maxBuffer: 500,
        noreport: true
        options:
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'
      workularBrowser:
        closurePath: pathCC
        js: build.src
        jsOutputFile: 'build/browser/workular.min.js'
        maxBuffer: 500,
        noreport: true
        options:
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'
  # https://www.npmjs.com/package/grunt-append-sourcemapping
  #create_source_map: 'build/vida.js.map'
  #source_map_format: 'V3'


  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-mkdir'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-closure-compiler'

  grunt.registerTask('build', ['mkdir','jshint','closure-compiler','copy','concat'])
  grunt.registerTask('default', ['build'])

