#include "../common/types.religo"

type storage = {
	previous_contract: address,
	administrator: address,
	pending_administrator: option(address),
	disabled: bool
}

type main_result = (list(operation), storage);

type donation = [@layout:comb] {
    asset_value: option(asset_value),
    payload: option(bytes)
}

type administrator_action =
    | Set_administrator(address)
    | Confirm_administrator
    | Set_disabled(bool);

type action =
    | Send_donation(donation)
    | Administrator_action(administrator_action);
