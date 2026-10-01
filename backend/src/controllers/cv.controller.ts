import type {Request,Response,NextFunction} from "express";
import cvService from "../services/cv.service";
import {cvIdSchema} from "../validators/cv.validate";
import {successResponse} from "../utils/response";
import {AppError} from "../exceptions";
function cvId(req:Request) {const id=cvIdSchema.safeParse(req.params.id);if(!id.success)throw new AppError("ID CV không hợp lệ","BAD_REQUEST",400);return id.data;}
class CvController {
 async remove(req:Request,res:Response,next:NextFunction){try{return successResponse(res,await cvService.remove(req.profile.id,cvId(req)),"Xóa CV thành công");}catch(e){next(e);}}
 async list(req:Request,res:Response,next:NextFunction){try{return successResponse(res,await cvService.list(req.profile.id),"Lấy danh sách CV thành công");}catch(e){next(e);}}
 async detail(req:Request,res:Response,next:NextFunction){try{return successResponse(res,await cvService.detail(req.profile.id,cvId(req)),"Lấy CV thành công");}catch(e){next(e);}}
 async create(req:Request,res:Response,next:NextFunction){try{return successResponse(res,await cvService.create(req.profile.id,req.body),"Tạo CV thành công",201);}catch(e){next(e);}}
 async update(req:Request,res:Response,next:NextFunction){try{return successResponse(res,await cvService.save(req.profile.id,req.body,cvId(req)),"Lưu CV thành công");}catch(e){next(e);}}
}
export default new CvController();
