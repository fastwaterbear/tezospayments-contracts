#include "../common/types.religo"

type storage = {
    metadata: service_metadata,
    allowed_tokens: allowed_tokens,
    owner: service_owner,
	paused: bool,
	deleted: bool,
}

type main_result = (list(operation), storage);

type service_parameters_updates = [@layout:comb] {
    metadata: option(service_metadata),
    allowed_tokens: [@layout:comb] {
        tez: option(bool),
        assets: option(set(address))
    }
}

type owner_action =
    | Set_owner(service_owner)
    | Set_pause(bool)
    | Set_deleted(bool)
    | Update_service_parameters(service_parameters_updates);

type action =
    // TODO
    | AcceptPayment
    | Owner_action(owner_action);
