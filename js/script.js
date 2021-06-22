let body = document.querySelector("body");

let video = document.querySelector("video");
// video.msHorizontalMirror = true;
let vidBtn = document.querySelector("#record");
let capBtn = document.querySelector("#capture");
let galleryBtn = document.querySelector("#gallery");

let zoomIn = document.querySelector("#zoom-in");
let zoomOut = document.querySelector("#zoom-out");

let filters = document.querySelectorAll(".filter");

let constraints = {
    video: true,
    // audio: true        
};

let mediaRecorder;
let isRecording = false;
let chunks = [];

let currZoom = 1;
let minZoom = 1;
let maxZoom = 3;

galleryBtn.addEventListener("click", function(e) {
    location.assign("gallery.html");
})


let filter = "";
let bwFilter = false;

for (let i = 0; i < filters.length; i++) {
    filters[i].addEventListener("click", function (e) {
        filter = e.currentTarget.style.backgroundColor;
        removeFilter();
        video.style.filter = "none";
        bwFilter = false;
        if (filter) {
            applyColorFilter(filter);
        } else if(e.currentTarget.style.filter) {
            bwFilter = true;
            applyBWFilter();
        }
    })
}

zoomIn.addEventListener("click", function (e) {
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];
    if (vidCurrScale > maxZoom) {
        return;
    } else {
        currZoom = Number(vidCurrScale) + 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

zoomOut.addEventListener("click", function (e) {
    let vidCurrScale = video.style.transform.split("(")[1].split(")")[0];
    if (vidCurrScale <= minZoom) {
        return;
    } else {
        currZoom = Number(vidCurrScale) - 0.1;
        video.style.transform = `scale(${currZoom})`;
    }
});

vidBtn.addEventListener("click", function (e) {
    let innerDiv = vidBtn.querySelector("div");
    if (isRecording) {
        innerDiv.classList.remove("record-animation");
        mediaRecorder.stop();
        isRecording = false;
    } else {
        innerDiv.classList.add("record-animation");
        filter = "";
        removeFilter();
        video.style.transform = "scale(1)";
        currZoom = 1;
        mediaRecorder.start();
        isRecording = true;
    }
});

navigator.mediaDevices.getUserMedia(constraints).then(function (mediaStream) {
    video.srcObject = mediaStream;
    let options = { mimeType: "video/webm; codecs=vp9" };
    mediaRecorder = new MediaRecorder(mediaStream, options);

    mediaRecorder.addEventListener("dataavailable", function (e) {
        chunks.push(e.data);
    });

    mediaRecorder.addEventListener("stop", function (e) {
        let blob = new Blob(chunks, { type: "video/mp4" });
        addMedia("video", blob);
        chunks = [];

        // let url = URL.createObjectURL(blob);

        // let a = document.createElement("a");
        // a.href = url;
        // a.download = "video.mp4";
        // a.click();
        // a.remove();
    });
});

capBtn.addEventListener("click", function () {
    capture();
});

function capture() {
    let innerDiv = capBtn.querySelector("div");
    innerDiv.classList.add("capture-animation");
    setTimeout(function () {
        innerDiv.classList.remove("capture-animation");
    }, 500);

    let c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;

    let ctx = c.getContext("2d");

    ctx.translate(c.width / 2, c.height / 2);
    ctx.scale(currZoom, currZoom);
    ctx.translate(-c.width / 2, -c.height / 2);

    ctx.drawImage(video, 0, 0);
    if (filter != "") {
        ctx.fillStyle = filter;
        ctx.fillRect(0, 0, c.width, c.height);
    }
    
    else if(bwFilter) {
        const imgData = ctx.getImageData(0, 0, c.width, c.height);
        for (i = 0; i < imgData.data.length; i += 4) {
            let count = imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2];
            let colour = 0;
            if (count > 510) colour = 255;
            else if (count > 255) colour = 127.5;

            imgData.data[i] = colour;
            imgData.data[i + 1] = colour;
            imgData.data[i + 2] = colour;
            imgData.data[i + 3] = 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // let a = document.createElement("a");
    // a.download = "image.jpg";
    // a.href = c.toDataURL();
    addMedia("img", c.toDataURL());
    // a.click();
    // a.remove();
}

function applyColorFilter(filterColor) {
    let filterDiv = document.createElement("div");
    filterDiv.classList.add("filter-div");
    filterDiv.style.backgroundColor = filterColor;
    body.appendChild(filterDiv);
}

function applyBWFilter(filterColor) {
    video.style.filter = "grayscale(100%)";
}

function removeFilter() {
    let filterDiv = document.querySelector(".filter-div");
    if (filterDiv)
        filterDiv.remove();
}