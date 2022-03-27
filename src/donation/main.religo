#include "./types.religo"
#include "./actions.religo"
#include "./administrator-actions.religo"

let main = ((action, storage): (action, storage)): main_result =>
    switch (action) {
        | Confirm_administrator => confirm_administrator(storage);
        | Send_donation(donation) => send_donation(donation, storage);
        | Administrator_action(administrator_action) => administrator_main(administrator_action, storage);
    };