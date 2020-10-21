// const multer = require('multer')
// const fs = require('fs')

// module.exports = {
//     uploader(destination, fileNamePrefix){
//         let defaultPath = './public'
//         console.log(defaultPath)
//         const storage = multer.diskStorage({
//             destination: (req, file, cb) => {
//                 const dir = defaultPath + destination;
//                 console.log(dir)
//                 if (fs.existsSync(dir)) {
//                     console.log(dir, "exists")
//                     cb(null, dir);
//                 }else {
//                     fs.mkdir(dir, {recursive: true}, err => cb(err, dir))
//                     console.log(dir, "make")
//                 }
//             },
//             filename: (req, file, cb) => {
//                 let originalname = file.originalname;
//                 let ext = originalname.split('.')
//                 let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1]
//                 cb(null, filename)
//             }
//         })

//         const imageFilter = (req, file, callback) => {
//             const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/;
//             if (!file.originalname.match(ext)) {
//                 return callback(new Error('Only selected type are allowed'), false)
//             }
//             callback(null, true)
//         }

//         return multer({
//             storage: storage,
//             fileFilter: imageFilter,
//             // melimit filesize
//             // limits:{
//             //     fileSize: 5 * 1024 *1024
//             // }
//         })
//     }
// }

const multer=require('multer')
const fs=require('fs')

module.exports={
    uploader(destination, fileNamePrefix){ //parameter biasa 
        // destinition : tempat dimana foto bakal disimpan
        // filenamePrefix:itu nama depan filenyaa 
        let defaultPath = './public'; //

        const storage = multer.diskStorage({
            destination: (req, file, cb) => {
                const dir = defaultPath + destination;
                console.log(dir)
                if (fs.existsSync(dir)) {
                    console.log(dir, "exists")
                    cb(null, dir);
                } else {
                    fs.mkdir(dir,{recursive:true}, err => cb(err, dir));
                    console.log(dir, "make")
                }
            },
            filename: (req, file, cb) => {
                let originalname = file.originalname;
                let ext = originalname.split('.');
                let filename = fileNamePrefix + Date.now() + '.' + ext[ext.length - 1];
                cb(null, filename);
            }
        });
        const imageFilter = (req, file, callback) => {
            const ext = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx)$/;//regex
            if (!file.originalname.match(ext)) {
                return callback(new Error('Only selected file type are allowed'), false);
            }
            callback(null, true);
        };

        return multer({
            storage: storage,
            fileFilter: imageFilter,
            // limits:{
            //     fileSize: 1 * 1024 * 1024 // 1MB
            // }
        });
    }
}