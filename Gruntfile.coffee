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
            'build/node'
          ]

    copy:
      package:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'package.json'
        dest: 'build/node/'
      readmeNode:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'README.md'
        dest: 'build/node/'
      readmeBrowser:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'README.md'
        dest: 'build/browser/'
      bower:
        expand: true
        flatten: true
        filter: 'isFile'
        src: 'bower.json'
        dest: 'build/browser/'


    concat:
      workular:
        src: build.lib.concat build.src
        dest: 'tmp/workular-concat.js'
      browserClosure:
        src: 'etc/workular-browser.js'
        dest: 'tmp/browser.js'
      nodeWrapper:
        src: 'etc/workular-node.js'
        dest: 'tmp/node.js'
      nodeMock:
        src: 'src/workular-mock.js'
        dest: 'build/node/workular-mock.js'
      browserMock:
        src: 'src/workular-mock.js'
        dest: 'build/browser/workular-mock.js'

    insert:
      browser:
        src: 'tmp/workular-concat.js'
        dest: 'tmp/browser.js'
        match: '//###INSERTWORKULAR'
      node:
        src: 'tmp/workular-concat.js'
        dest: 'tmp/node.js'
        match: '//###INSERTWORKULAR'

    uglify:
      options:
        mangle: false
        compress: false
        beautify: true
        preserveComments: true
      browser:
        src: 'tmp/browser.js'
        dest: 'build/browser/workular-debug.js'
      node:
        src: 'tmp/node.js'
        dest: 'build/node/workular-debug.js'
      browserDebug:
        src: 'tmp/workular-concat.js'
        dest: 'build/browser/workular.js'
      nodeDebug:
        src: 'tmp/workular-concat.js'
        dest: 'build/node/workular.js'

    'closure-compiler':
      workularBrowser:
        closurePath: pathCC
        js: build.src
        jsOutputFile: 'build/browser/workular.min.js'
        maxBuffer: 500,
        noreport: true
        options:
          compilation_level: 'ADVANCED_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'
          create_source_map: 'build/browser/workular.min.js.map'
      workularNode:
        closurePath: pathCC
        js: build.src
        jsOutputFile: 'build/node/workular.min.js'
        maxBuffer: 500,
        noreport: true
        options:
          compilation_level: 'SIMPLE_OPTIMIZATIONS'
          language_in: 'ECMASCRIPT5_STRICT'
          create_source_map: 'build/node/workular.min.js.map'

    clean:
      all:
        src: ['tmp', 'build']

    jshint:
      workular:
        options:
          smarttabs: true
          sub: true
        files:
          src: 'src/*.js'

    karma:
      unit:
        configFile: 'etc/karma.conf.js'
        singleRun: true
        browser: ['FireFox']



  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-mkdir'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-closure-compiler'
  grunt.loadNpmTasks 'grunt-insert'
  grunt.loadNpmTasks 'grunt-karma'

  grunt.registerTask 'default', ['build']
  grunt.registerTask 'test', ['jshint', 'karma']

  grunt.registerTask 'build-pretty', ['copy', 'concat', 'insert', 'uglify']
  grunt.registerTask 'build-min', ['closure-compiler']
  grunt.registerTask 'build', ['test', 'clean', 'mkdir',
                               'build-min', 'build-pretty']

