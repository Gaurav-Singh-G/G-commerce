import multiparty from 'multiparty';
import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs';
import mime from 'mime-types';
import {mongooseConnect} from "@/lib/mongoose";
import {authorizeAdminRequest} from "@/lib/authorizeAdminRequest";
const containerName = 'ecom-admin-container';

export default async function handle(req,res) {
  await mongooseConnect();
  await authorizeAdminRequest(req,res);

  const form = new multiparty.Form();
  const {fields,files} = await new Promise((resolve,reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({fields,files});
    });
  });
  console.log('length:', files.file.length);
//   const client = new S3Client({
//     region: 'us-east-1',
//     credentials: {
//       accessKeyId: process.env.S3_ACCESS_KEY,
    //   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     },
//   });
  const sasToken = process.env.NEXT_PRIVATE_STORAGESASTOKEN;
  const storageAccountName = process.env.NEXT_PRIVATE_STORAGERESOURCENAME;

  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );
  const containerClient = blobService.getContainerClient(containerName);
  // const client = azure.createBlobService(process.env.BLOB_CONNECTION_STRING);
  
  const links = [];
  for (const file of files.file) {
    const ext = file.originalFilename.split('.').pop();
    const newFilename = Date.now() + '.' + ext;
    const blobClient = containerClient.getBlockBlobClient(newFilename);
    const options = { blobHTTPHeaders: { blobContentType: file.type } };
    console.log(file);
    await blobClient.uploadData(fs.readFileSync(file.path), options);
    const link = `https://ecomadmin.blob.core.windows.net/${containerName}/${newFilename}`;
    links.push(link);
  }
  return res.json({links});
}

export const config = {
  api: {bodyParser: false},
};