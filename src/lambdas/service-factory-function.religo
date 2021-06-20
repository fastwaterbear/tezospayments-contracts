#include "../services-factory/types.religo"

let service_factory_function: service_factory_function = [%Michelson ({| {
    UNPAIR ;
    PUSH nat 0 ;
    SWAP ;
    DUP ;
    DUG 2 ;
    GET 3 ;
    CDR ;
    SIZE ;
    COMPARE ;
    EQ ;
    SWAP ;
    DUP ;
    DUG 2 ;
    GET 3 ;
    CAR ;
    NOT ;
    AND ;
    IF { PUSH string "No allowed tokens" ; FAILWITH } {} ;
    PUSH nat 0 ;
    SWAP ;
    DUP ;
    DUG 2 ;
    GET 4 ;
    SIZE ;
    COMPARE ;
    EQ ;
    IF { PUSH string "Payment types set is empty" ; FAILWITH } {} ;
    SWAP ;
    PUSH bool False ;
    SENDER ;
    PAIR ;
    PAIR ;
    SWAP ;
    DUP ;
    DUG 2 ;
    CAR ;
    PUSH bool False ;
    PAIR ;
    DUP 3 ;
    GET 3 ;
    DIG 3 ;
    GET 4 ;
    PAIR ;
    PAIR ;
    PAIR ;
    AMOUNT ;
    NONE key_hash ;

    CREATE_CONTRACT
#include "../../build/michelson/service.tz"
        ;
    PAIR
} |}: service_factory_function)];

let main = (_: (service_factory_function, unit)): (list(operation), unit) => failwith("Should not be called")
