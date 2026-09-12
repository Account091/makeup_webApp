import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../domain/repositories/i_service_repository.dart';
import 'service_event.dart';
import 'service_state.dart';

class ServiceBloc extends Bloc<ServiceEvent, ServiceState> {
  final IServiceRepository repository;

  ServiceBloc({required this.repository}) : super(ServiceInitialState()) {
    on<FetchServicesEvent>(_onFetchServices);
  }

  Future<void> _onFetchServices(
    FetchServicesEvent event,
    Emitter<ServiceState> emit,
  ) async {
    emit(ServiceLoadingState());
    try {
      final services = await repository.getServices();
      emit(ServicesLoadedState(services));
    } catch (e) {
      emit(ServiceErrorState(e.toString()));
    }
  }
}
