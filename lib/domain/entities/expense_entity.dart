import 'package:equatable/equatable.dart';

enum ExpenseCategory { travel, assistant, products, studio, marketing, other }

class ExpenseEntity extends Equatable {
  final String expenseId;
  final ExpenseCategory category;
  final double amount;
  final String vendor;
  final String? bookingId;
  final String notes;
  final DateTime spentAt;

  const ExpenseEntity({
    required this.expenseId,
    required this.category,
    required this.amount,
    required this.vendor,
    this.bookingId,
    this.notes = '',
    required this.spentAt,
  });

  @override
  List<Object?> get props => [expenseId, category, amount, vendor, bookingId, notes, spentAt];
}
