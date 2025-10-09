
export const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File, 
    callback: Function
) => {
    if (!file) return callback(new Error('No file provided'), false); 
    // Check file type
    const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!fileTypes.includes(file.mimetype)) {
        return callback(new Error('Invalid file type'), false);
    }

    callback(null, true);
};
