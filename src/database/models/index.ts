import { Sequelize } from 'sequelize';
import { Role,RoleModel } from './Roles';
import { User, UserModel } from './User';
import { School, SchoolModel } from './School';
import { SchoolProfile,SchoolProfileModel } from './SchoolProfile';
import { SchoolGallery,SchoolGalleryModel } from './SchoolGallery';
import { SchoolSpot,SchoolSpotModel } from './SchoolSpot';
import { Student, StudentModel } from './Student';
import { Application, ApplicationModel } from './Application';
import { SubscriptionSetting, SubscriptionSettingModel } from './SubscriptionSetting';
import { SubscriptionPayment, SubscriptionPaymentModel } from './SubscriptionPayment';

interface Modals {
  Role: typeof Role;
  User:typeof User;
  School:typeof School;
  SchoolProfile:typeof SchoolProfile;
  SchoolGallery:typeof SchoolGallery,
  SchoolSpot:typeof SchoolSpot,
  Student: typeof Student;
  Application: typeof Application;
  SubscriptionSetting: typeof SubscriptionSetting;
  SubscriptionPayment: typeof SubscriptionPayment;

}
export const AllModal = (sequelize: Sequelize): Modals => ({
  Role: RoleModel(sequelize),
  User:UserModel(sequelize),
  School:SchoolModel(sequelize),
  SchoolProfile:SchoolProfileModel(sequelize),
  SchoolGallery:SchoolGalleryModel(sequelize),
  SchoolSpot:SchoolSpotModel(sequelize),
  Student: StudentModel(sequelize),
  Application: ApplicationModel(sequelize),
  SubscriptionSetting: SubscriptionSettingModel(sequelize),
  SubscriptionPayment: SubscriptionPaymentModel(sequelize),



});