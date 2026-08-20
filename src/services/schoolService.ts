import { School } from '../database/models/School';
import { User } from '../database/models/User';
import { Role } from '../database/models/Roles';
import { ISchoolRegister,IUpdateSchoolProfile,ICreateSchoolGallery,ICreateSchoolSpot,IUpdateSchoolSpot ,SearchFilters} from '../types/School';
import { sequelize } from '../database';
import { SchoolAttributes } from '../database/models/School';
import { emailEmitter } from '../events/emailEvent';
import { SchoolProfile } from '../database/models/SchoolProfile';
import { SchoolGallery } from '../database/models/SchoolGallery';
import { SchoolSpot } from '../database/models/SchoolSpot';
import { Op, where as sequelizeWhere, literal } from 'sequelize';
import { startTrial } from './subscriptionService';


export const registerSchool = async (userId: string, data: ISchoolRegister) => {

  const existingCode= await School.findOne({where:{schoolCode:data.schoolCode}});
  if(existingCode) throw new Error('School code already exists');
  const existingEmail= await School.findOne({where:{email:data.email}});
  if(existingEmail) throw new Error('School email already exists');
  return School.create({
    ...data,
    userId, 
    status: 'pending',
  });
  
};


export const approveSchool = async (schoolId: string, adminId: string) => {
  return sequelize.transaction(async (t) => {
    const school = await School.findByPk(schoolId, { transaction: t });
    if (!school) throw new Error('School not found');

    school.status = 'approved';
    school.approvedBy = adminId;
    school.approvedAt = new Date();
    await school.save({ transaction: t });
    await startTrial(school, t);


    const manager = await User.findByPk(school.userId, { transaction: t });
    if (!manager) throw new Error('Manager not found');

    manager.schoolId = school.id;
    await manager.save({ transaction: t });
     emailEmitter.emit("schoolApproved",manager,school);
    return school;
  });
};

/**
 * Reject a school (done by Admin)
 */
export const rejectSchool = async (schoolId: string, adminId: string, reason: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  school.status = 'rejected';
  school.approvedBy = adminId;
  school.rejectedReason = reason;
  school.approvedAt = new Date();
  await school.save();

 // Rejection is a school-level action; don't block it just because the
 // registering manager's account was later deleted - just skip the email.
 const manager = await User.findByPk(school.userId, { paranoid: false });
  if (manager) {
    emailEmitter.emit("schoolRejected", manager, school, reason);
  }
  return school;
};

/**
 * Reassign a school to a different SchoolManager (Admin only) - e.g. when the
 * original manager's account was deleted and the school is left orphaned.
 */
export const reassignSchoolManager = async (schoolId: string, newManagerId: string) => {
  return sequelize.transaction(async (t) => {
    const school = await School.findByPk(schoolId, { transaction: t });
    if (!school) throw new Error('School not found');

    const newManager = await User.findByPk(newManagerId, { transaction: t });
    if (!newManager) throw new Error('User not found');

    const role = await Role.findByPk(newManager.roleId, { transaction: t });
    if (!role || role.name !== 'SchoolManager') {
      throw new Error('The new manager must have the SchoolManager role');
    }

    if (newManager.schoolId && newManager.schoolId !== schoolId) {
      throw new Error('This user is already managing a different school');
    }

    const previousManagerId = school.userId;

    school.userId = newManagerId;
    await school.save({ transaction: t });

    newManager.schoolId = schoolId;
    await newManager.save({ transaction: t });

    if (previousManagerId && previousManagerId !== newManagerId) {
      const previousManager = await User.findByPk(previousManagerId, { transaction: t, paranoid: false });
      if (previousManager && previousManager.schoolId === schoolId) {
        previousManager.schoolId = null;
        await previousManager.save({ transaction: t });
      }
    }

    return school;
  });
};

/**
 * Get school details by ID (with manager info)
 */
export const getSchoolById = async (id: string) => {
  return School.findByPk(id, {
    include: [
      {
        model: User,
        as: 'SchoolManager',
        attributes: ['id', 'firstName', 'lastName', 'email', 'district', 'profileImage'],
        paranoid: false,
      },
    ],
  });
};

/**
 * Get all schools (with optional status filter + pagination)
 */
export const getSchools = async (
  limit: number,
  offset: number,
  page: number,
  status?: 'pending' | 'not_registered'|'approved' | 'rejected'
) => {
  const whereClause = status ? { status } : {};

  const { rows, count } = await School.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'schoolName', 'district', 'status', 'licenseDocument', 'approvedAt'],
    include: [
      {
        model: User,
        as: 'SchoolManager',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        // Keep this visible for admin oversight even if the account was later deleted
        paranoid: false,
      },
      {
        model: User,
        as: 'ApprovedByAdmin',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        paranoid: false,
      },


      {
        model: SchoolProfile,
        as: 'profile',
        attributes: [
          'profilePhoto',
          'mission',
          'vision',
          'description',
          'foundedYear'

        ]
      }
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};


/**
 * Get only pending schools
 */
export const getPendingSchools = async (limit:number,offset:number) => {
  return School.findAndCountAll(
    {
      where:{status:'pending'},
      limit,
      offset,
       order: [['createdAt', 'DESC']],
    }
  );
};

/**
 * Get only approved schools
 */
export const getApprovedSchools = async (
  limit: number,
  offset: number,
  page: number
) => {
  const { rows, count } = await School.findAndCountAll({
    where: { status: 'approved', subscriptionStatus: { [Op.ne]: 'expired' } },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: SchoolProfile,
        as: 'profile',
        attributes: [
          'profilePhoto',
          'mission',
          'vision',
          'foundedYear'

        ]
      }
    ]
  });

  return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};



/**
 * Get only rejected schools
 */
export const getRejectedSchools = async (limit:number,offset:number,page:number) => {
  const {rows,count}=await School.findAndCountAll({
    where:{status:'rejected'},
    limit,
    offset,
  });
    return {
    schools: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };

};

export const resubmitSchool = async (
  schoolId: string,
  userId: string,
  updatedData: Partial<ISchoolRegister>
) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  if (school.userId !== userId) throw new Error('Unauthorized: Only the school manager can resubmit');

  if (school.status !== 'rejected') throw new Error('Only rejected schools can be resubmitted');

  Object.assign(school, updatedData);
  school.status = 'pending';
  school.approvedBy = null;
  school.approvedAt = null;
  school.rejectedReason = null;

  await school.save();
  return school;
};

export const updateSchoolProfile = async (schoolId: string, data: IUpdateSchoolProfile,_userId:string) => {
  let profile = await SchoolProfile.findOne({ where: { schoolId } });

  if (!profile) {
    
    profile = await SchoolProfile.create({ ...data, schoolId });
  } else {
    await profile.update(data);
  }

  return profile;
};
export const getSchoolProfile = async (schoolId: string ,limit:number,offset:number,page:number) => {
  const {rows,count} = await SchoolProfile.findAndCountAll({ where: { schoolId }, limit, offset,order: [['createdAt', 'DESC']] });

  return {
    profiles: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  
};

export const createSchoolSpot = async (
  schoolId: string,
  data: ICreateSchoolSpot,
  _userId: string
) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');
  if (school.schoolLevel?.length && !school.schoolLevel.includes(data.level)) {
    throw new Error(
      `This school is not registered for ${data.level}. Add it under "Levels offered" in the school profile first.`
    );
  }

  const occupiedSpots = data.occupiedSpots ?? 0;
  const registrationOpen = data.registrationOpen ?? true;

  // Calculate available spots
  const availableSpots = data.totalSpots - occupiedSpots;

  // If A-level with combinations, create separate spots for each combination
  if (data.level === 'A-level' && data.combination?.length) {
    const createdSpots = await Promise.all(
      data.combination.map(async (combo) => {
        const spotData = {
          ...data,
          schoolId,
          occupiedSpots,
          registrationOpen,
          availableSpots,
          combination: [combo], 
        };
        return SchoolSpot.create(spotData);
      })
    );
    return createdSpots;
  }

  
  const schoolSpot = await SchoolSpot.create({
    ...data,
    schoolId,
    occupiedSpots,
    registrationOpen,
    availableSpots,
  });

  return schoolSpot;
};
export const updateSchoolSpot = async (schoolId: string, spotId: string, data: IUpdateSchoolSpot,_userId:string) => {
  const spot = await SchoolSpot.findOne({ where: { id: spotId, schoolId } });
  if (!spot) throw new Error('School spot not found');

  if (data.level) {
    const school = await School.findByPk(schoolId);
    if (school?.schoolLevel?.length && !school.schoolLevel.includes(data.level)) {
      throw new Error(
        `This school is not registered for ${data.level}. Add it under "Levels offered" in the school profile first.`
      );
    }
  }

  return spot.update(data);
};

export const listSchoolSpots = async (schoolId: string,limit:number,offset:number,page:number) => {
  const {rows,count} = await SchoolSpot.findAndCountAll({ where: { schoolId }, limit, offset,order: [['createdAt', 'DESC']] });
    return {
    spots: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
  
};

export const deleteSchoolSpot = async (schoolId: string, spotId: string,_userId:string) => {
  const spot = await SchoolSpot.findOne({ where: { id: spotId, schoolId } });
  if (!spot) throw new Error('School spot not found');
  await spot.destroy();
  return true;
};



export const addGalleryImage = async (schoolId: string, data: ICreateSchoolGallery,_userId:string) => {
  return SchoolGallery.create({ ...data, schoolId });
};


export const listGalleryImages = async (schoolId: string,limit:number,offset:number,page:number,category?:string) => {

  const where: any = { schoolId };

  if (category) {
    where.category = category; 
  }

  const { rows, count } = await SchoolGallery.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ['order', 'ASC'],
      ['createdAt', 'DESC'],
    ],
  });

  return {
    images: rows,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};


export const updateGalleryImage = async (schoolId: string, imageId: string, data: Partial<ICreateSchoolGallery>,_userId:string) => {
  const image = await SchoolGallery.findOne({ where: { id: imageId, schoolId } });
  if (!image) throw new Error('Gallery image not found');
  return image.update(data);
};
 
export const deleteGalleryImage = async (schoolId: string, imageId: string,_userId:string) => {
  const image = await SchoolGallery.findOne({ where: { id: imageId, schoolId } });
  if (!image) throw new Error('Gallery image not found');
  await image.destroy();
  return true;
};


export const updateSchoolInfo = async (schoolId: string, data: SchoolAttributes,_userId:string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found');

  const allowedFields: (keyof SchoolAttributes)[] = [
    'province', 'district', 'sector', 'cell', 'village',
    'schoolType', 'schoolCategory', 'schoolLevel', 'licenseDocument','telephone','email','schoolName'
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      (school as any)[field] = data[field];
    }
  });

  await school.save();
  return school;
  
};

export const deleteSchool = async (schoolId: string) => {
  const school = await School.findByPk(schoolId);
  if (!school) throw new Error('School not found'); 
  await school.destroy();
  return true;
};

// schoolType/schoolLevel/schoolCategory/studentType are Postgres ENUM columns,
// so they need an exact value in the declared casing - ILIKE doesn't apply
// cleanly to enums. Rather than fail a search because someone typed
// "mixed" instead of "Mixed", resolve to the canonical casing when a
// case-insensitive match exists; otherwise fall through to the raw value
// (a genuinely invalid filter should still correctly return no results).
const normalizeEnum = <T extends string>(value: string, options: readonly T[]): string =>
  options.find((o) => o.toLowerCase() === value.toLowerCase()) ?? value;

const SCHOOL_TYPES = ['Girls', 'Boys', 'Mixed'] as const;
const SCHOOL_CATEGORIES = ['REB', 'RTB'] as const;
const SCHOOL_LEVELS = ['Nursery', 'Primary', 'O-level', 'A-level'] as const;
const STUDENT_TYPES = ['newcomer', 'transfer'] as const;

export const searchSchools = async (
  limit: number,
  offset: number,
  page: number,
  filters: SearchFilters
) => {
  const { schoolName, district, schoolType, schoolLevel, schoolCategory, yearOfStudy, combination, academicYear, minAvailableSpots, studentType } = filters;

  const schoolWhere: any = { status: 'approved', subscriptionStatus: { [Op.ne]: 'expired' } };
  if (schoolName) schoolWhere.schoolName = { [Op.iLike]: `%${schoolName}%` };
  if (district) schoolWhere.district = { [Op.iLike]: district };
  if (schoolType) schoolWhere.schoolType = normalizeEnum(schoolType, SCHOOL_TYPES);
  if (schoolLevel) schoolWhere.schoolLevel = { [Op.contains]: [normalizeEnum(schoolLevel, SCHOOL_LEVELS)] };
  if (schoolCategory) schoolWhere.schoolCategory = normalizeEnum(schoolCategory, SCHOOL_CATEGORIES);

  // A school only qualifies if it has at least one spot matching these conditions
  const spotWhere: any = {};

  if (yearOfStudy) spotWhere.yearofstudy = { [Op.iLike]: yearOfStudy };
  if (academicYear) spotWhere.academicYear = { [Op.iLike]: academicYear };
  if (combination) spotWhere.combination = { [Op.contains]: [combination] };
  if (studentType) spotWhere.studentType = normalizeEnum(studentType, STUDENT_TYPES);
  if (minAvailableSpots) {
    spotWhere[Op.and as any] = sequelizeWhere(
      literal('"spots"."totalSpots" - "spots"."occupiedSpots"'),
      { [Op.gte]: minAvailableSpots }
    );
  }

  const { rows, count } = await School.findAndCountAll({
    where: schoolWhere,
    include: [
      {
        model: SchoolSpot,
        as: 'spots',
        where: spotWhere,
        required: true,
      },
      {
        model: SchoolProfile,
        as: 'profile',
        attributes: ['profilePhoto', 'mission', 'vision', 'description', 'foundedYear'],
      },
    ],
    limit,
    offset,
    distinct: true,
    order: [['createdAt', 'DESC']],
  });

  const schools = rows.map((school) => school.get({ plain: true }));

  return {
    schools,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
  };
};
