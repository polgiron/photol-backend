import aws from 'aws-sdk';

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'eu-west-3'
});

// const s3 = new aws.S3();
const S3 = new aws.S3({ params: { Bucket: process.env.S3_BUCKET } });

export default S3;
