/**
 * Takes a date and formats it to a string that's easier to read
 *
 * @example
 *
 * formatDate('2022-01-12 16:50:20') // Returns 'Jan 12, 2022, 4:50 PM'
 * formatDate('2022-01-12 16:50:20', false) // Returns 'Jan 12, 2022'
 * formatDate('not-a-real-date') // Returns 'Invalid Date'
 *
 */
export const formatDate = (
  date: string | null | undefined,
  includeTime = true
): string => {
  if (!date) {
    return 'Invalid Date';
  }

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };

  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
  }

  const formattedDate = new Date(date).toLocaleDateString('en-US', options);

  // Although the date may be valid, it may be marked as invalid on Android
  // or iOS. Adding a 'T' between the time and date and the time fixes it
  // 2022-01-12 16:50:20 => 2022-01-12T16:50:20
  // https://github.com/expo/expo/issues/782#issuecomment-421173445
  if (formattedDate === 'Invalid Date') {
    return new Date(date.replace(' ', 'T')).toLocaleDateString('en-US', options);
  }

  return formattedDate;
};
