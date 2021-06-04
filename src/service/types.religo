type allowed_tokens_storage = [@layout:comb] {
    tez: bool,
    assets: set(address)
}

type storage = {
    metadata: bytes,
    allowed_tokens: allowed_tokens_storage,
    owner: address,
	paused: bool,
	deleted: bool,
}

type main_result = (list(operation), storage);

type owner_action =
    | Set_owner(address)
    | Set_pause(bool)
    | Set_deleted(bool);

type action =
    | Owner_action(owner_action);
