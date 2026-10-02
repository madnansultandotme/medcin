import 'package:intl/intl.dart';

/// Date formatting utilities
class DateFormatter {
  /// Format date as "Mon, Jan 15, 2024"
  static String formatFullDate(DateTime date) {
    return DateFormat('EEE, MMM d, yyyy').format(date);
  }
  
  /// Format date as "January 15, 2024"
  static String formatLongDate(DateTime date) {
    return DateFormat('MMMM d, yyyy').format(date);
  }
  
  /// Format date as "Jan 15"
  static String formatShortDate(DateTime date) {
    return DateFormat('MMM d').format(date);
  }
  
  /// Format time as "2:30 PM"
  static String formatTime(DateTime time) {
    return DateFormat('h:mm a').format(time);
  }
  
  /// Format date and time as "Jan 15, 2024 at 2:30 PM"
  static String formatDateTime(DateTime dateTime) {
    return DateFormat('MMM d, yyyy \'at\' h:mm a').format(dateTime);
  }
  
  /// Get relative time (e.g., "2 hours ago", "Tomorrow")
  static String formatRelative(DateTime date) {
    final now = DateTime.now();
    final difference = date.difference(now);
    
    if (difference.inDays == 0) {
      if (difference.inHours == 0) {
        if (difference.inMinutes == 0) {
          return 'Just now';
        }
        return '${difference.inMinutes} minutes ${difference.isNegative ? 'ago' : 'from now'}';
      }
      return '${difference.inHours} hours ${difference.isNegative ? 'ago' : 'from now'}';
    } else if (difference.inDays == 1) {
      return 'Tomorrow';
    } else if (difference.inDays == -1) {
      return 'Yesterday';
    } else if (difference.inDays > 1 && difference.inDays < 7) {
      return 'In ${difference.inDays} days';
    } else if (difference.inDays < -1 && difference.inDays > -7) {
      return '${-difference.inDays} days ago';
    } else {
      return formatFullDate(date);
    }
  }
  
  /// Check if date is today
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year && 
           date.month == now.month && 
           date.day == now.day;
  }
  
  /// Check if date is in the past
  static bool isPast(DateTime date) {
    return date.isBefore(DateTime.now());
  }
  
  /// Check if date is in the future
  static bool isFuture(DateTime date) {
    return date.isAfter(DateTime.now());
  }
}
