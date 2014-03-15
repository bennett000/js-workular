# Build For: Worker, Browser, Node
#
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

    uglify:
      build:
        files:
          'build/browser/workular.min.js': ['src/workular.js']
          'build/worker/workular.min.js': ['src/workular.js']

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





  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-mkdir'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-concat'

  grunt.registerTask('build', ['mkdir','jshint','uglify','copy','concat'])
  grunt.registerTask('default', ['build'])

