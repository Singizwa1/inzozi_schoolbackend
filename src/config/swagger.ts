import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Inzozi School API',
      version: '1.0.0',
      description: 'Backend API for Inzozi School platform. Supports school search, registration, and multi-language support.',
    },
    servers: [
  {
    url: 'https://inzozischool-backend.onrender.com/',
    description: 'Production Server (Render)',
  },
  {
    url: 'http://localhost:5000',
    description: 'Development Server',
  },
],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', example: 'admin@example.com' },
            password: { type: 'string', example: 'Password123' },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    name:{ type: 'string' },
                    email: { type: 'string' },
                    roleName:{type:'string'},
                  },
                },
                token: { type: 'string' },
              },
            },
            message: { type: 'string', example: 'Login successful' },
            success: { type: 'boolean', example: true },
          },
        },
        ForgotPasswordRequest: {
  type: 'object',
  required: ['email'],
  properties: {
    email: { type: 'string', example: 'user@example.com' },
  },
},
ForgotPasswordResponse: {
  type: 'object',
  properties: {
    data: { type: 'null', example: null },
    message: { type: 'string', example: 'A reset code has been sent to your email' },
    success: { type: 'boolean', example: true },
  },
},

VerifyOtpRequest: { type: 'object', required: ['otp'], properties: { otp: { type: 'string', example: '123456' } } },
VerifyOtpResponse: {
  type: 'object',
  properties: {
    data: { 
      type: 'object', 
      properties: { email: { type: 'string', example: 'user@example.com' } } 
    },
    message: { type: 'string', example: 'OTP verified successfully. You may now reset your password' },
    success: { type: 'boolean', example: true },
  },
},


ResetPasswordRequest: { type: 'object', required: ['newPassword'], properties: { newPassword: { type: 'string', example: 'MyNewStrongPassword123!' } } },
ResetPasswordResponse: {
  type: 'object',
  properties: {
    data: { type: 'null', example: null },
    message: { type: 'string', example: 'Password reset successfully' },
    success: { type: 'boolean', example: true },
  },
},

        CreateSchoolManagerRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'email', 'password', 'gender', 'district'],
          properties: {
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            email: { type: 'string', example: 'john@example.com' },
            password: { type: 'string', example: 'Password123' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Male' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Nyarugenge' },
            schoolId: { type: 'string', format: 'uuid', example: null },
          },
        },

        GetUsersResponse: {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'c8b248f1-4a57-44ae-a159-801715e7aeae' },
    firstName: { type: 'string', example: 'Admission' },
    lastName: { type: 'string', example: 'Manager' },
    gender: { type: 'string', example: 'Other' },
    province: { type: ['string', 'null'], example: null },
    district: { type: 'string', example: 'Kigali' },
    email: { type: 'string', format: 'email', example: 'admissionmanager@example.com' },
    password: { type: 'string', example: '$2b$10$bCPQF2xg6WpDItpseQQcu.SJrQuObaZ1aSN4Niul77djTvrq.PB56' },
    roleId: { type: 'string', format: 'uuid', example: 'ffaa293f-a7b7-4d6b-b8a9-640fadc2ed18' },
    profileImage: { type: ['string', 'null'], example: null },
    schoolId: { type: ['string', 'null'], example: null },
    deletedAt: { type: ['string', 'null'], format: 'date-time', example: null },
    createdAt: { type: 'string', format: 'date-time', example: '2025-09-12T07:11:20.128Z' },
    updatedAt: { type: 'string', format: 'date-time', example: '2025-09-12T07:11:20.128Z' },
    role: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: 'ffaa293f-a7b7-4d6b-b8a9-640fadc2ed18' },
        name: { type: 'string', example: 'AdmissionManager' }
      }
    },
    School: {
      type: ['object', 'null'],
      nullable: true,
      example: null
    }
  }
},

        CreateSchoolManagerResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: { id: 'uuid', email: 'john@example.com', roleId: 'uuid' },
            },
            message: { type: 'string', example: 'School Manager registered successfully' },
            success: { type: 'boolean', example: true },
          },
        },
           UpdateUserRequest: {
          type: 'object',
          properties: {
            firstName: { type: 'string', example: 'Jane' },
            lastName: { type: 'string', example: 'Smith' },
            email: { type: 'string', example: 'jane.smith@example.com' },
            password: { type: 'string', minLength: 6, example: 'NewPass123!' },
            gender: { type: 'string', enum: ['Male', 'Female', 'Other'], example: 'Female' },
            province: { type: 'string', example: 'Kigali' },
            district: { type: 'string', example: 'Gasabo' },
            profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
            schoolId: { type: 'string', format: 'uuid', example: 'uuid-here' },
          },
        },
         UpdateUserResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              example: {
                id: 'uuid',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                gender: 'Female',
                province: 'Kigali',
                district: 'Gasabo',
                profileImage: 'https://cdn.example.com/avatar.png',
                schoolId: 'uuid-here',
              },
            },
            message: { type: 'string', example: 'User updated successfully' },
            success: { type: 'boolean', example: true },
          },
        },

          SchoolRegisterRequest: {
          type: 'object',
          required: ['schoolName', 'schoolCode', 'email', 'district','licenseDocument'],
          properties: {
            schoolName: { type: 'string', example: 'Akagera High School' },
            schoolCode: { type: 'string', example: '1234567' },
            email: { type: 'string', example: 'school@example.com' },
            district: { type: 'string', example: 'Nyarugenge' },
            licenseDocument: { type: 'string', format: 'binary', description: 'Upload license document' },
            
          },
        },
        SchoolResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid', example: 'uuid-here' },
                schoolName: { type: 'string', example: 'Akagera High School' },
                schoolCode: { type: 'string', example: '1234567' },
                email: { type: 'string', example: 'school@example.com' },
                district: { type: 'string', example: 'Nyarugenge' },
                status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
                licenseDocument: { type: 'string', example: 'https://res.cloudinary.com/.../license.pdf' },
                approvedBy: { type: 'string', format: 'uuid', example: null },
                approvedAt: { type: 'string', format: 'date-time', example: null },
                rejectedReason: { type: 'string', example: null },
                createdAt: { type: 'string', format: 'date-time', example: '2025-09-09T10:06:28.223Z' },
                updatedAt: { type: 'string', format: 'date-time', example: '2025-09-09T10:06:28.223Z' },
              },
            },
            message: { type: 'string', example: 'School registered successfully' },
            success: { type: 'boolean', example: true },
          },
        },
             RejectSchoolRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: { type: 'string', example: 'Incomplete documents' },
          },
        },
        ResubmitSchoolRequest: {
          type: 'object',
          properties: {
            schoolName: { type: 'string', example: 'Akagera High School Updated' },
            schoolCode: { type: 'string', example: '1234567' },
            email: { type: 'string', example: 'school@example.com' },
            district: { type: 'string', example: 'Nyarugenge' },
            licenseDocument: { type: 'string', format: 'binary', description: 'Upload updated license document' },
          },
        },

        
                GetMeResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                firstName: { type: 'string', example: 'John' },
                lastName: { type: 'string', example: 'Doe' },
                email: { type: 'string', example: 'john@example.com' },
                gender: { type: 'string', example: 'Male' },
                province: { type: 'string', example: 'Kigali' },
                district: { type: 'string', example: 'Nyarugenge' },
                profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
                roleId: { type: 'string', example: 'uuid-role' },
                schoolId: { type: 'string', format: 'uuid', example: 'uuid-school' },
              },
            },
            message: { type: 'string', example: 'Authenticated user fetched successfully' },
            success: { type: 'boolean', example: true },
          },
        },
        GetUserByIdResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid' },
                firstName: { type: 'string', example: 'Jane' },
                lastName: { type: 'string', example: 'Smith' },
                email: { type: 'string', example: 'jane.smith@example.com' },
                gender: { type: 'string', example: 'Female' },
                province: { type: 'string', example: 'Kigali' },
                district: { type: 'string', example: 'Gasabo' },
                profileImage: { type: 'string', example: 'https://cdn.example.com/avatar.png' },
                roleId: { type: 'string', example: 'uuid-role' },
                schoolId: { type: 'string', format: 'uuid', example: 'uuid-school' },
              },
            },
            message: { type: 'string', example: 'User fetched successfully' },
            success: { type: 'boolean', example: true },
          },
        },
        


        CreateAdmissionManagerRequest: {
  type: 'object',
  required: ['firstName','lastName','email','password','gender','district','schoolId',],
    
  properties: {
    firstName: { type: 'string',example: 'Alice', },
  
    lastName: {
      type: 'string',
      example: 'Smith',
    },
    email: {
      type: 'string',
      example: 'alice@example.com',
    },
    password: {
      type: 'string',
      example: 'SecurePass123',
    },
    gender: {
      type: 'string',
      enum: ['Male', 'Female', 'Other'],
      example: 'Female',
    },
    district: {
      type: 'string',
      example: 'Gasabo',
    },
    schoolId: {
      type: 'string',
      format: 'uuid',
      example: '550e8400-e29b-41d4-a716-446655440000',
    },
  },
},
CreateAdmissionManagerResponse: {
  type: 'object',
  properties: {
    success: {
      type: 'boolean',
      example: true,
    },
    message: {
      type: 'string',
      example: 'Admission Manager created successfully',
    },
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: 'ca93e40c-30a2-4b0b-9ec9-b0301478a0d6',
        },
        firstName: {
          type: 'string',
          example: 'Alice',
        },
        lastName: {
          type: 'string',
          example: 'Smith',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'alice@example.com',
        },
        gender: {
          type: 'string',
          enum: ['Male', 'Female', 'Other'],
          example: 'Female',
        },
        district: {
          type: 'string',
          example: 'Gasabo',
        },
        schoolId: {
          type: 'string',
          format: 'uuid',
          example: '550e8400-e29b-41d4-a716-446655440000',
        },
        roleName: {
          type: 'string',
          example: 'AdmissionManager',
        },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-09-13T14:14:49.425Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-09-13T14:14:49.425Z',
        },
      },
    },
  },
},


  UpdateSchoolProfileSchema: {
    type: 'object',
    properties: {
      description: { type: 'string', example: 'A great school for all students' },
      mission: { type: 'string', example: 'Provide quality education' },
      vision: { type: 'string', example: 'Excellence in education' },
      foundedYear: { type: 'integer', minimum: 1800, maximum: new Date().getFullYear(), example: 2005 },
     // accreditation: { type: 'string', example: 'REB' },
      //languagesOffered: { type: 'array', items: { type: 'string' }, example: ['English', 'French'] },
      //extracurriculars: { type: 'array', items: { type: 'string' }, example: ['Football', 'Debate'] },
      profilePhoto: { type: 'string', format: 'binary', example: 'https://res.cloudinary.com/.../profile.jpg' },
    },
  },

  UpdateSchoolInfoSchema : {
  type: 'object',
  properties: {
    schoolName: { type: 'string', example: 'Inzozi International School' },
    schoolCode: { type: 'string', example: 'INS123' },
    schoolCategory: { 
      type: 'string', 
      enum: ['REB', 'RTB'], 
      example: 'REB', 
      nullable: true 
    },
    schoolLevel: { 
      type: 'string', 
      enum: ['Nursery', 'Primary', 'O-Level', 'A-Level'], 
      example: 'Primary', 
      nullable: true 
    },
    schoolType: { 
      type: 'string', 
      enum: ['Girls', 'Boys', 'Mixed'], 
      example: 'Mixed', 
      nullable: true 
    },
    province: { type: 'string', example: 'Kigali', nullable: true },
    district: { type: 'string', example: 'Gasabo' },
    sector: { type: 'string', example: 'Kacyiru', nullable: true },
    cell: { type: 'string', example: 'Kacyiru Cell', nullable: true },
    village: { type: 'string', example: 'Village 1', nullable: true },
    email: { type: 'string', format: 'email', example: 'info@inzozischool.com' },
    telephone: { type: 'string', example: '+250788123456', nullable: true },
    licenseDocument: { type: 'string', example: 'https://res.cloudinary.com/.../license.pdf', nullable: true },
  },
  required: [], // all fields optional for update
},



  CreateSchoolSpotSchema: {
    type: 'object',
    required: ['level', 'studentType', 'academicYear', 'yearofstudy', 'totalSpots'],
    properties: {
      level: { type: 'string', enum: ['Nursery', 'Primary', 'O-level', 'A-level'], example: 'O-level' },
      studentType: { type: 'string', enum: ['newcomer', 'transfer'], example: 'newcomer' },
      academicYear: { type: 'string', example: '2025/2026' },
      yearofstudy: { type: 'string', example: 'Year 3' },
      totalSpots: { type: 'integer', minimum: 0, example: 50 },
      occupiedSpots: { type: 'integer', minimum: 0, example: 10 },
      registrationOpen: { type: 'boolean', example: true },
      waitingListCount: { type: 'integer', minimum: 0, example: 5 },
      combination: { type: 'array', items: { type: 'string' }, example: ['Math', 'Physics'] },
      admissionConditions: {
        type: 'object',
        properties: {
          minGrade: { type: 'string', example: 'B' },
          requiredSubjects: { type: 'array', items: { type: 'string' }, example: ['English', 'Math'] },
          examScore: { type: 'string', example: '75%' },
          interviewRequired: { type: 'boolean', example: true },
          documents: { type: 'array', items: { type: 'string' }, example: ['Birth Certificate', 'ID'] },
          notes: { type: 'string', example: 'Priority for siblings of current students' },
        },
      },
    },
  },

  CreateStudentSchema : {
  type: 'object',
  required: [
    'firstName',
    'lastName',
    'gender',
    'DOB',
    'studentType',
    'passportPhoto',
    'fathersNames',
    'mothersNames',
    'representerEmail',
    'representerPhone',
    'nationality',
    'province',
    'district',
    'sector',
    'cell',
    'village',
  ],
  properties: {
    schoolId: { type: 'string', format: 'uuid', example: 'c1b7f2d0-1234-4c56-8ef0-123456abcdef' },
    firstName: { type: 'string', example: 'John' },
    middleName: { type: 'string', example: 'Doe' },
    lastName: { type: 'string', example: 'Smith' },
    gender: { type: 'string', enum: ['MALE', 'FEMALE', 'OTHER'], example: 'MALE' },
    DOB: { type: 'string', format: 'date', example: '2018-05-21' },
    studentType: { type: 'string', enum: ['newcomer', 'transfer'], example: 'newcomer' },
    passportPhoto: { type: 'string', format: 'binary' },
    fathersNames: { type: 'string', example: 'Peter Smith' },
    mothersNames: { type: 'string', example: 'Mary Smith' },
    representerEmail: { type: 'string', format: 'email', example: 'parent@example.com' },
    representerPhone: { type: 'string', example: '+250788123456' },
    nationality: { type: 'string', example: 'Rwandan' },
    province: { type: 'string', example: 'Kigali' },
    district: { type: 'string', example: 'Gasabo' },
    sector: { type: 'string', example: 'Kacyiru' },
    cell: { type: 'string', example: 'Nyarutarama' },
    village: { type: 'string', example: 'Village 1' },
    resultSlip: { type: 'string', format: 'binary' },
    previousReport: { type: 'string', format: 'binary' },
    mitationLetter: { type: 'string', format: 'binary' },
  },
},

 CreateApplicationSchema : {
  type: 'object',
  required: ['studentId'],
  properties: {
    studentId: { type: 'string', format: 'uuid', example: 'c1b7f2d0-1234-4c56-8ef0-123456abcdef' },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'], example: 'pending' },
  },
},

 ApproveApplicationSchema :{
  type: 'object',
  required: ['babyeyiDocument'],
  properties: {
    babyeyiDocument: { type: 'string', format: 'binary', description: 'Document to send to parent after approval' },
  },
},

RejectApplicationSchema : {
  type: 'object',
  required: ['rejectionReason'],
  properties: {
    rejectionReason: { type: 'string', example: 'Student does not meet minimum grade requirements' },
  },
},



 StudentResponseSchema: {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    level: { type: 'string', enum: ['Nursery', 'Primary', 'O-level', 'A-level'] },
    studentType: { type: 'string', enum: ['newcomer', 'transfer'] },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
    schoolId: { type: 'string', format: 'uuid' },
    babyeyiDocument: { type: 'string', nullable: true },
  },
},

ApplicationResponseSchema : {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    studentId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'approved', 'rejected'] },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
},

SearchSchoolsResponseSchema :{
  type: 'object',
  properties: {
    schools: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          schoolName: { type: 'string' },
          district: { type: 'string' },
          schoolType: { type: 'string', enum: ['Girls', 'Boys', 'Mixed'] },
          schoolLevel: { type: 'string', enum: ['Nursery', 'Primary', 'O-level', 'A-level'] },
          email: { type: 'string', format: 'email' },
          spots: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                level: { type: 'string', enum: ['Nursery', 'Primary', 'O-level', 'A-level'] },
                studentType: { type: 'string', enum: ['newcomer', 'transfer'] },
                academicYear: { type: 'string' },
                yearofstudy: { type: 'string' },
                totalSpots: { type: 'integer' },
                occupiedSpots: { type: 'integer' },
                availableSpots: { type: 'integer' },
                combination: { type: 'array', items: { type: 'string' } },
              },
            },
          },
        },
      },
    },
    total: { type: 'integer' },
    page: { type: 'integer' },
    limit: { type: 'integer' },
    totalPages: { type: 'integer' },
  },
},


  CreateSchoolGallerySchema: {
    type: 'object',
    required: ['category'],
    properties: {
      category: { 
        type: 'string', 
        enum: ['classroom', 'computerLab', 'library', 'sports', 'dining', 'dormitory', 'administration', 'playground'], 
        example: 'classroom' 
      },
      imageUrl:{ type: 'string', format: 'binary', example: 'https://res.cloudinary.com/.../imageUrl.jpg' },
      caption: { type: 'string', example: 'Our new science lab' },
      isFeatured: { type: 'boolean', example: true },
      order: { type: 'integer', minimum: 0, example: 1 },
    },
  },
        
      },
    },
  },
  apis: ['./src/routes/*.ts'], 
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
