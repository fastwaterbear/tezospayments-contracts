#include "../common/types.religo"

type services = big_map(service_owner, set(service));

type service_factory_function = (service_parameters) => (operation, service);

type storage = {
    services: big_map(service_owner, set(service)),
    administrator: address,	
    paused: bool,
    service_factory_function: service_factory_function,
}

type main_result = (list(operation), storage);

type administrator_action =
    | Set_administrator(address)
    | Set_pause(bool)
    | Set_service_factory_function(service_factory_function);

type action =
    | Create_service(service_parameters)
    | Administrator_action(administrator_action);
