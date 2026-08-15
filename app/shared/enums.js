// Shared enums used across the app and server

const RIDE_VISIBILITY = {
  PUBLIC: 'public',
  CLUB: 'club',
  PRIVATE: 'private',
};

const RIDE_STATUS = {
  RECORDING: 'recording',
  COMPLETED: 'completed',
};

const TRACKING_MODE = {
  GPS: 'gps',
  PHOTO_PROOF: 'photo_proof',
};

const CLUB_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

const INVITE_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
};

const AUTH_PROVIDER = {
  GOOGLE: 'google',
  APPLE: 'apple',
};

module.exports = {
  RIDE_VISIBILITY,
  RIDE_STATUS,
  TRACKING_MODE,
  CLUB_ROLE,
  INVITE_STATUS,
  AUTH_PROVIDER,
};
