import 'package:equatable/equatable.dart';

enum BookingStatus {
  awaitingApproval,
  depositPending,
  confirmed,
  completed,
  declined,
  cancelled,
}

class CustomerDetails extends Equatable {
  final String fullName;
  final String phone;
  final String email;
  final String? instagramHandle;

  const CustomerDetails({
    required this.fullName,
    required this.phone,
    required this.email,
    this.instagramHandle,
  });

  @override
  List<Object?> get props => [fullName, phone, email, instagramHandle];
}

class EventDetails extends Equatable {
  final String eventType; // Bridal, Engagement, Party, etc.
  final DateTime eventDate;
  final String readyByTime;
  final String venueLocation;
  final String city;
  final bool isOutstation;
  final double distanceKm;
  final int guestCount;

  const EventDetails({
    required this.eventType,
    required this.eventDate,
    required this.readyByTime,
    required this.venueLocation,
    required this.city,
    this.isOutstation = false,
    this.distanceKm = 0.0,
    this.guestCount = 1,
  });

  @override
  List<Object?> get props => [
        eventType,
        eventDate,
        readyByTime,
        venueLocation,
        city,
        isOutstation,
        distanceKm,
        guestCount,
      ];
}

class CommercialDetails extends Equatable {
  final double basePrice;
  final double travelFee;
  final double stayFee;
  final double discount;
  final double depositRequired;
  final double depositPaid;

  const CommercialDetails({
    required this.basePrice,
    this.travelFee = 0.0,
    this.stayFee = 0.0,
    this.discount = 0.0,
    required this.depositRequired,
    this.depositPaid = 0.0,
  });

  double get totalPrice => (basePrice + travelFee + stayFee) - discount;
  double get remainingBalance => totalPrice - depositPaid;

  @override
  List<Object?> get props => [
        basePrice,
        travelFee,
        stayFee,
        discount,
        depositRequired,
        depositPaid,
      ];
}

class BookingEntity extends Equatable {
  final String id;
  final CustomerDetails customer;
  final EventDetails event;
  final String serviceTitle;
  final String? packageName;
  final CommercialDetails commercials;
  final BookingStatus status;
  final List<String> referenceImages;
  final String? notes;
  final DateTime createdAt;

  const BookingEntity({
    required this.id,
    required this.customer,
    required this.event,
    required this.serviceTitle,
    this.packageName,
    required this.commercials,
    required this.status,
    this.referenceImages = const [],
    this.notes,
    required this.createdAt,
  });

  BookingEntity copyWith({
    BookingStatus? status,
    CommercialDetails? commercials,
    String? notes,
  }) {
    return BookingEntity(
      id: id,
      customer: customer,
      event: event,
      serviceTitle: serviceTitle,
      packageName: packageName,
      commercials: commercials ?? this.commercials,
      status: status ?? this.status,
      referenceImages: referenceImages,
      notes: notes ?? this.notes,
      createdAt: createdAt,
    );
  }

  @override
  List<Object?> get props => [
        id,
        customer,
        event,
        serviceTitle,
        packageName,
        commercials,
        status,
        referenceImages,
        notes,
        createdAt,
      ];
}
