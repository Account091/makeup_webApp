class ApiEndpoints {
  // Live Vercel Production Base URL
  static const String baseUrl = 'https://makeoverbyprachi.vercel.app';

  // System & Health Endpoints
  static const String health = '$baseUrl/api/health';
  static const String healthDependencies = '$baseUrl/api/health/dependencies';
  static const String systemMetrics = '$baseUrl/api/system/metrics';

  // Booking & Payments Endpoints
  static const String createBookingSession = '$baseUrl/api/booking/create-session';
  static const String submitPaymentProof = '$baseUrl/api/booking/submit-proof';
  static const String sendFcmNotification = '$baseUrl/api/system/send-fcm';

  // Location & Pricing Quotes
  static const String locationQuote = '$baseUrl/api/location/quote';

  // Marketplace & Catalog Endpoints
  static const String marketplaceArtists = '$baseUrl/api/marketplace/artists';
  static const String marketplaceReviews = '$baseUrl/api/marketplace/reviews';
  static const String marketplaceSearch = '$baseUrl/api/marketplace/search';

  // WhatsApp Cloud & Automation Webhooks
  static const String whatsappWebhook = '$baseUrl/api/ai/whatsapp/webhook';
  static const String whatsappAdminAction = '$baseUrl/api/ai/whatsapp/admin-action';

  // Helper method to prepend base url if relative path is given
  static String url(String path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '$baseUrl$cleanPath';
  }
}
