export interface ProfileRes {
  "_id": string,
  "displayName": string,
  "username": string | number,
  "roles": string[],
  "active": boolean,
  "experienceYears": number,
  "address": string,
  "level": string,
  "createdAt": string,
  "updatedAt": string,
  "__v": number
}
