import moment from 'moment';

export const formatDate = dateString => {
  let tz = dateString.match(/([+-]\d{2}:\d{2})$/);

  dateString = dateString.replace(/([+-]\d{2}:\d{2})$/, '');

  if (tz) {
    tz = tz[1];
  }

  return moment(dateString).format('ddd Do MMMM YYYY h:mm:ss a ') + 'GMT' + tz;
};
