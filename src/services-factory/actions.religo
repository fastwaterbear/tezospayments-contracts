#include "./types.religo"
#include "./errors.religo"

let get_or_create_services_set_by_service_owner = ((service_owner, services): (service_owner, services)): set(service) =>
    switch (Big_map.find_opt(service_owner, services)) {
        | Some(servicesSet) => servicesSet;
        | None => Set.empty;
    };

[@inline] let fail_if_contract_is_paused = (storage: storage) => if (storage.paused) { failwith(errors_contract_is_paused); };

let create_service = ((service_parameters, storage): (service_parameters, storage)): main_result => {
    fail_if_contract_is_paused(storage);

    let service_owner = Tezos.sender;
    let (operation, service) = storage.service_factory_function(service_parameters);

    let services_set = get_or_create_services_set_by_service_owner(service_owner, storage.services);
    let services = Big_map.add(service_owner, Set.add(service, services_set), storage.services);

    (
        [operation],
        { ...storage, services: services }
    )
};
