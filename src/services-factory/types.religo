type service_metadata = bytes;
type service = address;
type service_owner = address;
type service_factory_function = (service_metadata) => (operation, service);

type storage = {
    services: big_map(service_owner, list(service)),
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
    | Create_service(service_metadata)
    | Administrator_action(administrator_action);
