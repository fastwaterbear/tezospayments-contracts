#include "./types.religo"
#include "./errors.religo"

let get_or_create_services_set_by_service_owner = ((service_owner, services): (service_owner, services)): set(service) =>
    switch (Big_map.find_opt(service_owner, services)) {
        | Some(services_set) => services_set;
        | None => Set.empty;
    };

[@inline] let fail_if_caller_is_not_factory_implementation = (storage: storage) => {
    if (storage.factory_implementation != Tezos.sender) {
        failwith(errors_not_factory_implementation); 
    };
}
[@inline] let fail_if_contract_is_paused = (storage: storage) => if (storage.paused) { failwith(errors_contract_is_paused); };

let add_service = ((service_info, storage): (add_service_factory_parameters, storage)): main_result => {
    fail_if_caller_is_not_factory_implementation(storage);
    fail_if_contract_is_paused(storage);

    let services_set = get_or_create_services_set_by_service_owner(service_info.owner, storage.services);
    let services = Big_map.add(service_info.owner, Set.add(service_info.service, services_set), storage.services);

    (
        ([]: list(operation)),
        { ...storage, services: services }
    )
};
