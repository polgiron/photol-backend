import aws from 'aws-sdk';

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'eu-west-3'
});

// const s3 = new aws.S3();
export const S3 = new aws.S3({ params: { Bucket: process.env.S3_BUCKET } });

export const getSignedUrl = function(image, size) {
  let thumbPath;

  switch (size) {
    case 'small':
      thumbPath = process.env.SMALL_THUMB_SIZE;
      break;
    case 'big':
      thumbPath = process.env.BIG_THUMB_SIZE;
      break;
    default:
      thumbPath = process.env.BIG_THUMB_SIZE;
      break;
  }

  const thumbKey = `thumb/${image.s3Id}_${thumbPath}.${image.extension}`;

  const signedUrl = S3.getSignedUrl('getObject', {
    // Bucket: process.env.S3_BUCKET,
    // Key: image.s3Key,
    Key: thumbKey,
    Expires: 600 // 10 minutes
    // Expires: 300 // 5 minutes
  });

  // console.log('signedUrl', signedUrl);

  return signedUrl;
}

export const deleteS3Object = function(key) {
  // Delete from S3
  const params = {
    Key: key
  };

  S3.deleteObject(params, function (err, data) {
    if (err) console.log(err, err.stack);
    // else console.log('deleted from S3');
  });
}

export const deleteFromS3 = function(image) {
  // console.log('Delete from S3');
  deleteS3Object(`thumb/${image.s3Id}_${process.env.SMALL_THUMB_SIZE}.${image.extension}`);
  deleteS3Object(`thumb/${image.s3Id}_${process.env.BIG_THUMB_SIZE}.${image.extension}`);
  deleteS3Object(`ori/${image.s3Id}.${image.extension}`);
}

// export default S3;
