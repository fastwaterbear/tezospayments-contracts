#include "../common/types.religo"

type services = big_map(service_owner, set(service));

type factory_implementation = address;
type factory_implementation_version = service_version;
type factory_implementation_parameters = (bool, option(factory_implementation_version));

type storage = {
    services: big_map(service_owner, set(service)),
    administrator: address,
    paused: bool,
    factory_implementation: factory_implementation,
    factory_implementation_version: factory_implementation_version,
}

type main_result = (list(operation), storage);

type administrator_action =
    | Set_administrator(address)
    | Set_pause(bool)
    | Set_factory_implementation(factory_implementation);

type action =
    | Add_service(add_service_factory_parameters)
    | Administrator_action(administrator_action);
