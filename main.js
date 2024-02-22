const video = document.getElementById("video");
let face_ids = [];

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./modelos"),
    faceapi.nets.faceLandmark68Net.loadFromUri("./modelos"),
    faceapi.nets.faceRecognitionNet.loadFromUri("./modelos"),
    faceapi.nets.faceExpressionNet.loadFromUri("./modelos"),
    faceapi.nets.ageGenderNet.loadFromUri("./modelos")
]).then(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
            video.srcObject = mediaStream;
            video.onloadedmetadata = () => {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                const displaySize = { width: video.videoWidth, height: video.videoHeight };
                faceapi.matchDimensions(canvas, displaySize);

                setInterval(async () => {
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
                    const resizedDetections = faceapi.resizeResults(detections, displaySize);
                    faceapi.draw.drawDetections(canvas, resizedDetections);

                    imageData = canvas.toDataURL('image/png');
                    Compararfaceid();

                }, 100);
            };
        })
        .catch((error) => {
            alert("Error al acceder a la cámara web");
            console.error("Error al acceder a la cámara web:", error);
        });
});
var Compararfaceid = async () => {
    try {
        const ListUsuarios = await $.get("./controllers/usuario.controllers.php?op=video");
        const usuarios = JSON.parse(ListUsuarios);

        // Cargar la imagen de la cámara fuera del bucle
        const tensor1 = await faceapi.fetchImage(imageData);

        for (const usuario of usuarios) {
            const id = usuario.face_id; // Obtener el identificador de rostro del usuario
            console.log(id);
            
            // Verificar que la URL sea válida y contenga una imagen
            if (!id || typeof id !== 'string') {
                console.error("La URL de la imagen no es válida:", id);
                continue; // Saltar a la siguiente iteración
            }

            // Convertir la URL en un tensor utilizando fetchImage
            const tensor2 = await faceapi.fetchImage(id);

            try {
                // Detectar rostros en ambas imágenes
                const detection1 = await faceapi.detectSingleFace(tensor1).withFaceLandmarks().withFaceDescriptor();
                const detection2 = await faceapi.detectSingleFace(tensor2).withFaceLandmarks().withFaceDescriptor();

                // Verificar si se detectaron los rostros
                if (!detection1 || !detection2) {
                    console.error("No se pudieron detectar los rostros en una o ambas imágenes.");
                    continue; // Saltar a la siguiente iteración
                }

                // Comparar los rostros
                const faceMatcher = new faceapi.FaceMatcher([detection1.descriptor]);
                const mejorMatch = faceMatcher.findBestMatch(detection2.descriptor);
                console.log(mejorMatch);

                if (mejorMatch._label === "unknown") {
                    alert("Los rostros son diferentes.");
                } else {
                    alert("Los rostros son iguales.");
                }
            } catch (error) {
                console.error("Error al detectar los rostros:", error);
            }
        }

    } catch (error) {
        console.error("Ocurrió un error:", error);
    }
};
