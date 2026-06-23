import { Request, Response, NextFunction, RequestHandler } from 'express';
import Busboy from "busboy";

/**
 * AsyncHandler is an Express middleware function that wraps a 
 * Promise-based function in a try/catch block.
 * @param fn - The Promise-based function to wrap. 
 * @returns A RequestHandler that Express can safely execute.
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


export async function busboy_getRequest(req: Request, res: Response,
  //
  fileLambda?: (fieldname: string, data: Buffer, filename: string, mimeType: string) => Promise<void> | void,
  //
  finishLambda?: (fields: Record<string, string>) => Promise<void> | void): Promise<Record<string, string>> {

  return new Promise((resolve, reject) => {
    const fields: Record<string, string> = {};
    const uploadPromises: Promise<void>[] = [];

    const busboy = Busboy({ headers: req.headers });


    busboy.on("file", async (fieldname, file, info) => {
      const { filename, mimeType } = info;
      if (!filename) {
        file.resume();
        return;
      }
      
      if (fileLambda) {
        uploadPromises.push(
          Promise.resolve(
            fileLambda(fieldname, file, filename, mimeType)
          )
        );
      }

      // file.on("end", async () => {
      //   startedUploads -=1;
      // });
    });

    busboy.on("field", (name, value) => {
      fields[name] = value;
    });

    busboy.on("finish", async () => {
      try {
        //Wait for all file uploads to finish
        await Promise.all(uploadPromises);

        if (finishLambda) {
          await finishLambda(fields);
        }

        resolve(fields);
      } catch (err) {
        reject(err);
      }
    });

    busboy.on("error", reject);

    req.pipe(busboy);
  });
}

export default asyncHandler;