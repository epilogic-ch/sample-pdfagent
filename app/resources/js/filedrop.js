/**
 * Drag'n drop upload library
 * 
 * This library is based on https://css-tricks.com/drag-and-drop-file-uploading/
 * documentation. Link to jQuery has been removed and some callback methods have
 * been added.
 * 
 * @author  Nicolas Crittin - epilogic.ch
 * @date    2024-11-05
 * @version 1.0
 */

const filedrop = {
    options: {},

    // initialize de file drop zone
    init: function(options) {
        this.options = this.extend({
            // required settings
            url: undefined,             // form submit url
            selector: undefined,        // selector of drop zone(s)

            // optional settings
            method: 'POST',             // upload method
            maxFilesize: 0,             // max uploadable file size
            timeout: 0,                 // max fetch duration
            autoSubmit: true,           // enable auto-submit on drop or file selection

            // callbacks
            onDrop: undefined,          // function invoked on drop
            onSubmit: undefined,        // function invoked before submit
            onSuccess: undefined,       // function invoked on upload success
            onError: undefined,         // function invoked on upload error
            onComplete: undefined       // function invoked after upload
        }, (options || {}));

        const dragdropSupported = function() {
            var div = document.createElement('div');
            return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
        }();

        const self = this;

        if (this.options.url) {
            if (dragdropSupported && this.options.selector) {
                var dropzones = document.querySelectorAll(this.options.selector);
                Array.prototype.forEach.call(dropzones, function(dropzone) {
                    self.reset(dropzone);

                    if (self.options.autoSubmit) {
                        dropzone.classList.add('is-auto-submit');
                    }
                    else {
                        dropzone.classList.remove('is-auto-submit');
                    }

                    if (!dropzone.classList.contains('is-fd-enabled')) {
                        dropzone.classList.add("is-fd-enabled");

                        ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'].forEach(name => {
                            dropzone.addEventListener(name, function (e) {
                                e.preventDefault();
                                e.stopPropagation();
                            });
                        });

                        ['dragover', 'dragenter'].forEach(name => {
                            dropzone.addEventListener(name, function (e) {
                                dropzone.classList.add('is-dragover');
                            });
                        });

                        ['dragleave', 'dragend', 'drop'].forEach(name => {
                            dropzone.addEventListener(name, function (e) {
                                dropzone.classList.remove('is-dragover');
                            });
                        });

                        const input = dropzone.querySelector('input[type="file"]');

                        dropzone.addEventListener('drop', function (e) {
                            // in case of drop, put the files in file input
                            input.files = e.dataTransfer.files;
                            dropzone.classList.remove('is-dragover');
                            dropzone.classList.remove('is-uploading');
                            dropzone.classList.remove('is-success');
                            dropzone.classList.remove('is-error');
                            dropzone.classList.remove('is-oversize');

                            self.handleFiles(dropzone);
                        });

                        input.addEventListener('change', function (e) {
                            self.handleFiles(dropzone);
                        });

                        // firefox focus bug fix for file input
                        input.addEventListener('focus', function() { input.classList.add('has-focus'); });
                        input.addEventListener('blur', function() { input.classList.remove('has-focus'); });
                    }
                });
            }
        }
        else {
            console.error("Missing submit url for filedrop");
        }
    },

    // check selected files and launch submit / update label
    handleFiles: function(dropzone) {
        const self = this;
        const input = dropzone.querySelector('input[type="file"]');

        // check files size
        var fileCheckOk = true;
        if (this.options.maxFilesize) {
            Array.prototype.forEach.call(input.files, function(file) {
                if (file.size > self.options.maxFilesize) {
                    fileCheckOk = false;
                }
            });
        }

        if (fileCheckOk) {
            if (typeof this.options.onDrop == 'function') {
                try {
                    if (this.options.onDrop(dropzone, input.files) == false) {
                        this.reset(dropzone);
                        return false;
                    }
                }
                catch (e) {
                    console.error(e);
                    dropzone.classList.add('is-error');
                    return false;
                };
            }

            if (this.options.autoSubmit) {
                this.submit(dropzone);
            }
            else {
                this.displayFilename(dropzone);
            }
        }
        else {
            dropzone.classList.add('is-oversize');
        }
    },

    // perform XmlHttpRequest
    submit: function(dropzone) {
        if (typeof dropzone == "string") {
            dropzone = document.querySelector(dropzone);
        }

        // let's check if dropzone is a valid dom element
        if (dropzone.nodeType) {
            if (dropzone.classList.contains('is-uploading')) return false;

            const input = dropzone.querySelector('input[type="file"]');

            if (!input.files || input.files.length === 0) {
                input.files = null;
                return;
            }

            // prepare upload form data
            const ajaxData = new FormData();

            // add files
            if (input.files) {
                if (input.getAttribute("multiple")) {
                    Array.prototype.forEach.call(input.files, function(file) {
                        ajaxData.append(input.getAttribute('name'), file);
                    });
                }
                else {
                    ajaxData.append(input.getAttribute('name'), input.files[0]);
                }
            }

            // custom onSubmit callback
            if (typeof this.options.onSubmit === 'function') {
                try {
                    if (this.options.onSubmit(dropzone, ajaxData) == false) {
                        return false;
                    }
                }
                catch (e) {
                    console.error(e);
                    dropzone.classList.add('is-error');
                    return false;
                }
            }

            dropzone.classList.add('is-uploading');
            dropzone.classList.remove('is-error');

            // fetch options
            let fetchOpts = {
                method: this.options.method,
                body: ajaxData
            };
            if (this.options.timeout > 0) {
                fetchOpts.signal = AbortSignal.timeout(this.options.timeout)
            }

            // send request
            fetch(this.options.url, fetchOpts)
              .then(response => {
                  dropzone.classList.remove('is-uploading');

                  if (!response.ok) {
                      return Promise.reject(response);
                  }

                  return response;
              })
              .then(response => {
                  dropzone.classList.add('is-success');

                  // custom onSuccess callback
                  if (typeof this.options.onSuccess === 'function') {
                      try {
                          this.options.onSuccess(dropzone, response);
                      }
                      catch (e) {
                          console.error(e);
                      }
                  }
              })
              .catch(response => {
                  dropzone.classList.remove('is-uploading');
                  dropzone.classList.add('is-error');

                  // custom onError callback
                  if (typeof this.options.onError === 'function') {
                      try {
                          this.options.onError(dropzone, response);
                      }
                      catch (e) {
                          console.error(e);
                      }
                  }
              })
              .finally(() => {
                  input.files = null;
                  input.value = null;

                  // custom onComplete callback
                  if (typeof this.options.onComplete === 'function') {
                      try {
                          this.options.onComplete(dropzone);
                      }
                      catch (e) {
                          console.error(e);
                      }
                  }
              });
        }
    },

    // update label with file name / files number
    displayFilename: function(dropzones) {
        if (typeof dropzones === "string") {
            dropzones = document.querySelectorAll(dropzones);
        }
        else if (dropzones.nodeType) {
            dropzones = [ dropzones ];
        }

        Array.prototype.forEach.call(dropzones, function(dropzone) {
            const input = dropzone.querySelector('input[type="file"]');
            var droppedFiles = input.files;

            const label = dropzone.querySelector('label');

            if (input.getAttribute("multiple") && droppedFiles.length > 1) {
                let tmp = input.getAttribute('data-multiple-caption') || '';
                label.innerHTML = tmp.replace('[count]', droppedFiles.length);
            }
            else {
                label.innerHTML = droppedFiles[0].name;
            }
        });
    },

    // restore initial drop zone ui
    reset: function(dropzones) {
        if (typeof dropzones === "string") {
            dropzones = document.querySelectorAll(dropzones);
        }
        else if (dropzones.nodeType) {
            dropzones = [ dropzones ];
        }

        Array.prototype.forEach.call(dropzones, function(dropzone) {
            const label = dropzone.querySelector('label');
            label.innerHTML = dropzone.querySelector('.fd-base-label').innerHTML;

            dropzone.classList.remove('is-dragover');
            dropzone.classList.remove('is-uploading');
            dropzone.classList.remove('is-success');
            dropzone.classList.remove('is-error');
            dropzone.classList.remove('is-oversize');
        });
    },

    // extends an object with another one (equivalent to $.extend)
    extend: function(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
}
