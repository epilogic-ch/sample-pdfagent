const pdf = {
    pdfjsLib: undefined,
    pdf: undefined,
    onLoad: undefined,

    init: function(worker, onLoad) {
        this.reset();

        this.pdfjsLib = globalThis.pdfjsLib;
        this.pdfjsLib.GlobalWorkerOptions.workerSrc = worker;
        this.onLoad = onLoad;

        let sortableList = document.getElementById('pdf-pages');
        sortableList.addEventListener("dragover", function(e) {
            e.preventDefault();

            var elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);

            // Getting all items except currently dragging and making array of them
            let siblings = [...sortableList.querySelectorAll("li.pdf-page:not(.dragging)")];

            // Finding the sibling after which the dragging item should be placed
            let nextSibling = siblings.find(function(el) {
                return el === elementUnderCursor || el.contains(elementUnderCursor);
            });

            // Inserting the dragging item before the found sibling
            if (nextSibling) {
                let rect = nextSibling.getBoundingClientRect();
                let midX = rect.left + (rect.width / 2);
                if (e.clientX <= midX) {
                    sortableList.insertBefore(document.querySelector(".dragging"), nextSibling);
                } else if (nextSibling.nextSibling) {
                    nextSibling.parentNode.insertBefore(document.querySelector(".dragging"), nextSibling.nextSibling);
                } else {
                    nextSibling.parentNode.appendChild(document.querySelector(".dragging"));
                }
            }
        });
        sortableList.addEventListener("dragenter", e => e.preventDefault());
    },

    // Display pdf pages in canvas
    load: function(file) {
        var self = this;
        var reader = new FileReader();
        reader.onload = function() {
            var array = new Uint8Array(this.result);

            // Asynchronous download of PDF
            var loadingTask = self.pdfjsLib.getDocument({ data: array });
            loadingTask.promise.then(function(pdf) {
                self.pdf = pdf;
                self.renderPages();
            }, function (reason) {
                alert("PDF loading failed: " + reason);
            });

        }
        reader.readAsArrayBuffer(file);
    },

    reset: function() {
        document.getElementById('pdf-pages').innerHTML = '';
        document.getElementById('pageids').value = '';
    },

    // Download the new reordned pdf
    get: function() {
        var pages = document.querySelectorAll('ul#pdf-pages li.pdf-page');
        var ids = Array.from(pages).map(item => item.getAttribute('data-pageid'));

        if (ids.length > 0) {
            console.log(ids);
            document.getElementById('pageids').value = ids.join(',');
            ewt.submit('script', { name: 'pdf' });
        }
        else {
            alert("Unable to build empty PDF");
        }
    },

    // Render pages of pdf in list of canvas
    renderPages: function(pageId) {
        if (pageId == undefined) {
            this.renderPages(0);
        }
        else {
            var self = this;
            this.pdf.getPage(pageId + 1).then(function(page) {
                //console.log('Page ' + page._pageIndex + ' loaded');

                let viewport = page.getViewport({ scale: 297 / page.getViewport({scale : 1.0}).width });

                // Prepare canvas using PDF page dimensions
                let li = document.createElement('li');
                li.id = 'pdf-page-' + page._pageIndex;
                li.setAttribute('data-pageid', page._pageIndex);
                li.draggable = true;
                li.classList.add('pdf-page');
                    let head = document.createElement('div');
                    head.classList.add('page-head');
                        let span = document.createElement('div');
                        span.classList.add('page-num');
                        span.innerHTML = 'Page ' + (page._pageIndex + 1);
                        head.appendChild(span);
                        
                        let btn = document.createElement('button');
                        btn.type = 'button';
                        btn.addEventListener('click', function(e) {
                            e.target.closest('li').remove();
                        });
                        btn.innerHTML = '<i class="bi bi-x-lg"></i>';
                        head.appendChild(btn);
                    li.appendChild(head);

                    let body = document.createElement('div');
                    body.classList.add('page-body');
                        let canvas = document.createElement('canvas');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        body.appendChild(canvas);
                    li.appendChild(body);
                document.getElementById('pdf-pages').appendChild(li);

                // Add draggable options on pages
                // Based on https://www.codingnepalweb.com/drag-and-drop-sortable-list-html-javascript/
                li.addEventListener("dragstart", () => { setTimeout(() => li.classList.add("dragging"), 0); });
                li.addEventListener("dragend", () => li.classList.remove("dragging"));

                let context = canvas.getContext('2d');

                // Render PDF page into canvas context
                let renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                let renderTask = page.render(renderContext);
                renderTask.promise.then(function () {
                    if (self.pdf.numPages > page._pageIndex + 1) {
                        self.renderPages(page._pageIndex + 1);
                    }
                    else if (typeof self.onLoad == "function") {
                        self.onLoad();
                    }
                });
            });
        }
    }
}