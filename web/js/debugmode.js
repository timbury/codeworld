
/*
 * Copyright 2017 The CodeWorld Authors. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict";

window.debugMode = false;
window.debugMarkers = [];
window.debugActiveCB = null;

window.infobox = null;

function initDebugMode(getStackAtPoint, active) {
    var canvas = document.getElementById("screen");

    infobox = document.createElement("div");
    infobox.style.position = "absolute";
    infobox.style.border = "1px solid black";
    infobox.style.background = "white";
    infobox.style.minWidth = "60px";
    infobox.style.padding = "10px";
    infobox.style.display = "none";
    infobox.id = "infobox";
    document.body.appendChild(infobox);

    window.debugActiveCB = active;

    canvas.addEventListener("click", function (evt) {
        if (!debugMode) return;

        var ret = getStackAtPoint({
            x: evt.clientX,
            y: evt.clientY,
        });

        clearMarkers();

        var stack = ret.stack;
        if (stack) {
            var pic, i, marker;
            var printable = false;

            infobox.innerHTML = "";
            for (i=stack.length-1;i>=0;i--) {
                pic = stack[i];
                if (!pic)
                    continue;

                printable = true;

                marker = parent.codeworldEditor.markText({
                    line: pic.srcLoc.startLine-1,
                    ch: pic.srcLoc.startCol-1
                }, {
                    line: pic.srcLoc.endLine-1,
                    ch: pic.srcLoc.endCol-1
                },{
                    className: "marked"
                });
                debugMarkers.push(marker);

                var link = document.createElement("a");
                var text = document.createTextNode(
                        pic.name + "@" + pic.srcLoc.startLine + ":" + stack[i].srcLoc.startCol);
                var br = document.createElement("br");

                link.href = "#";
                link.addEventListener("click", (function (pic) {
                    parent.codeworldEditor.setCursor({
                        line: pic.srcLoc.startLine-1,
                        ch: pic.srcLoc.startCol-1
                    });
                }).bind(null,pic) );

                link.appendChild(text);
                infobox.appendChild(link);
                infobox.appendChild(br);
            }

            if (printable) {
                infobox.style.left = evt.clientX + "px";
                infobox.style.top  = evt.clientY + "px";

                infobox.style.display = "block";

                if (evt.clientX + infobox.offsetWidth > 500) {
                    infobox.style.left = (evt.clientX - infobox.offsetWidth) + "px";
                }

                if (evt.clientY + infobox.offsetHeight > 500) {
                    infobox.style.top = (evt.clientY - infobox.offsetHeight) + "px";
                }
            } else {
                // If user clicks on a coordinatePlane, stack may contain
                // only null
                infobox.style.display = "none";
            }
        } else {
            infobox.style.display = "none";
        }
    });

    window.addEventListener("unload", function () {
        clearMarkers();
    });

    canvas.onblur = (function (evt) {
        infobox.style.display = "none";
    });
}

function clearMarkers() {
    while (debugMarkers.length > 0) {
        debugMarkers.pop().clear();
    }
}

function startDebugMode() {
    if (!infobox) {
        throw new Error("Can't start debugMode: isPointInPath not registered via initDebugMode!");
    }
    window.debugMode = true;
    window.debugActiveCB(true);
}

function stopDebugMode() {
    if (infobox) {
        infobox.style.display = "none";
    }
    window.debugMode = false;
    clearMarkers();
    window.debugActiveCB(false);
}

function toggleDebugMode() {
    if (window.debugMode) {
        stopDebugMode();
    } else {
        startDebugMode();
    }
}