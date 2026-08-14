import { Response } from 'express';
import * as SchoolService from '../services/schoolService';
import { ResponseService } from '../utils/response';
import { uploadToCloud } from '../utils/uploadHelper';
import { IRequestUser } from '../middlewares/authMiddleware';
import { getPagination } from '../utils/pagination';
import { asString } from '../utils/helper';


const getUserId = (req: IRequestUser): string => {
  if (!req.user || !req.user.id) {
    throw new Error('Unauthorized: User not found');
  }
  return req.user.id;
};

export const updateProfile = async (req: IRequestUser, res: Response) => {
  try {
    
    const updatedProfile = req.body; 

    const schoolId = asString(req.params.schoolId);

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    if (!req.file) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Profile photo is required',
        res,
      });
    }

    const profilePhoto = await uploadToCloud(req.file);

    const profile = await SchoolService.updateSchoolProfile(schoolId, {...updatedProfile,profilePhoto},getUserId(req));

    return ResponseService({
      data: profile,
      status: 200,
      success: true,
      message: 'Profile updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update profile',
      res,
    });
  }
};


// PROFILE
export const getProfile = async (req: IRequestUser, res: Response) => {
  try {
    const {page,limit,offset}=getPagination( parseInt(req.query.page as string)|| 1, parseInt(req.query.limit as string) || 10);

    const schoolId = asString(req.params.schoolId);

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    

  const result =await SchoolService.getSchoolProfile(schoolId,limit,offset,page);

    return ResponseService({
      data: result,
      status: 200,
      success: true,
      message: 'Profile retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to get profile',
      res,
    });
  }
};



// SPOTS
export const createSpot = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const spotData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const spot = await SchoolService.createSchoolSpot(schoolId, spotData,getUserId(req));

    return ResponseService({
      data: spot,
      status: 201,
      success: true,
      message: 'Spot created successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to create spot',
      res,
    });
  }
};

export const updateSpot = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const spotId = asString(req.params.id);
    const updatedSpot = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!spotId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    const spot = await SchoolService.updateSchoolSpot(schoolId, spotId, updatedSpot,getUserId(req));

    return ResponseService({
      data: spot,
      status: 200,
      success: true,
      message: 'Spot updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update spot',
      res,
    });
  }
};

export const listSpots = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const {page,limit,offset}=getPagination( parseInt(req.query.page as string)|| 1, parseInt(req.query.limit as string) || 10);

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const spots = await SchoolService.listSchoolSpots(schoolId,limit,offset,page);

    return ResponseService({
      data: spots,
      status: 200,
      success: true,
      message: 'Spots retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to list spots',
      res,
    });
  }
};

// GALLERY
export const addGallery = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const galleryData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!req.file) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Gallery file is required',
        res,
      });
    }

    const imageUrl = await uploadToCloud(req.file);

    const gallery = await SchoolService.addGalleryImage(schoolId, {
      ...galleryData,
      imageUrl,
    },getUserId(req));

    return ResponseService({
      data: gallery,
      status: 201,
      success: true,
      message: 'Gallery image added successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to add gallery image',
      res,
    });
  }
};

export const listGallery = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const { page, limit, offset } = getPagination(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 10
    );

    const category = req.query.category as string | undefined; 

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    const images = await SchoolService.listGalleryImages(schoolId,limit, offset, page,category );
      
       return ResponseService({
      data: images,
      status: 200,
      success: true,
      message: 'Gallery retrieved successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to list gallery images',
      res,
    });
  }
};

export const updateGallery = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const imageId = asString(req.params.id);
    let updatedData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }

    if (!imageId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Image ID is required',
        res,
      });
    }

    
    if (req.file) {
      const fileUrl = await uploadToCloud(req.file);
      updatedData = { ...updatedData, imageUrl: fileUrl };
    }

    const image = await SchoolService.updateGalleryImage(schoolId, imageId, updatedData,getUserId(req));

    return ResponseService({
      data: image,
      status: 200,
      success: true,
      message: 'Gallery image updated successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to update gallery image',
      res,
    });
  }
};

export const deleteGallery = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const imageId = asString(req.params.id);
    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    if (!imageId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'Image ID is required',
        res,
      });
    }
    await SchoolService.deleteGalleryImage(schoolId, imageId,getUserId(req));

    return ResponseService({
      data: null,
      status: 200,
      success: true,
      message: 'Gallery image deleted successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to delete gallery image',
      res,
    });
  }
};

export const updateSchoolInfo = async (req: IRequestUser, res: Response) => {
  try {
       const schoolId = asString(req.params.schoolId);
    let updatedData = req.body;

    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    
    const school = await SchoolService.updateSchoolInfo(schoolId,updatedData,getUserId(req));
    return ResponseService({ data: school, status: 200, success: true, message: 'School information updated', res });
  } catch (error: any) {
    return ResponseService({ data: error.message, status: 500, success: false, message: 'Failed to update school information', res });
  }
};
export const deleteSchoolSpot = async (req: IRequestUser, res: Response) => {
  try {
    const schoolId = asString(req.params.schoolId);
    const spotId = asString(req.params.id);
    if (!schoolId) {
      return ResponseService({
        data: null,
        status: 400,
        success: false,
        message: 'School ID is required',
        res,
      });
    }
    if (!spotId) {
      return ResponseService({
        data: null, 
        status: 400,
        success: false,
        message: 'Spot ID is required', 
        res,
      });
    }
    await SchoolService.deleteSchoolSpot(schoolId, spotId,getUserId(req));

    return ResponseService({
      data: null,
      status: 200,
      success: true,  
      message: 'School spot deleted successfully',
      res,
    });
  } catch (error: any) {
    return ResponseService({
      data: error.message,
      status: 500,
      success: false,
      message: 'Failed to delete school spot',
      res,
    });
  }
};
