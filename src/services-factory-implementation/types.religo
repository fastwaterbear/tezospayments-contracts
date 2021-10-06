#include "../common/types.religo"

type storage = {
    factory: address,
    version: service_version,
    disabled: bool
}

type main_result = (list(operation), storage);

type action =
    | Set_disabled((bool, option(service_version)))
    | Create_service(service_parameters);
