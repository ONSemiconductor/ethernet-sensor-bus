# Protobuf encoding

Protocol Buffers (protobuf) encode a message as a compact sequence of bytes and decode it again. Generated code hides the encoding. The authoritative description is the Protocol Buffers guide [Encoding](https://protobuf.dev/programming-guides/encoding/).

## Fields and records

A `.proto` file defines a message as a list of fields. Each field has a name, a type, and a *field number*:

```text
message fldTstamp {
   fixed32 sec  = 1;
   fixed32 nsec = 2;
}
```

The encoding identifies a field by its number, not by its name. A field number never changes and is never reused.

An encoded message is a sequence of *records*, one for each field that is present. A record is a tag followed by the value. The tag holds the field number and the *wire type*, which defines how the value is stored:

```text
tag = (field number << 3) | wire type
```

| Wire type | Number | Used for                                                                    |
| :-------- | -----: | :-------------------------------------------------------------------------- |
| `VARINT`  |      0 | `int32`, `int64`, `uint32`, `uint64`, `sint32`, `sint64`, `bool`, and enums |
| `LEN`     |      2 | `string`, `bytes`, embedded messages, and packed repeated fields            |
| `I32`     |      5 | `fixed32`, `sfixed32`, and `float`                                          |

The wire type also tells a decoder how long the value is, so that it can skip an unknown field. RCP clients skip unknown fields in reports, but RCP servers reject them in directives, see [Messages](02_messages.md).

## Values

Most numbers are *varints*: each byte carries seven bits of the number, least significant group first, and its most significant bit indicates whether another byte follows. Values up to 127 take one byte, values up to 16383 take two bytes, and so on. For example, 150 is written as `96 01`:

```text
150 in binary:                   1001 0110
in groups of seven bits:         0000001 0010110
least significant group first:   0010110 0000001
with the continuation bits:      10010110 00000001
                                 = 96 01
```

The types `fixed32` and `sfixed32` always take four bytes, least significant byte first. The schema uses `fixed32` for the sequence numbers (`msgDirective.seq`) and the fields of the timestamp (`fldTstamp`).

Strings, `bytes`, and embedded messages are stored as a length, written as a varint, followed by that many bytes. An embedded message is a complete message of its own, so a directive nests records several levels deep, from the operation to the action to the command of an endpoint. Each level adds a tag and a length.

## Field presence and default values

A field that is not present takes no space. A singular scalar field without `optional` and outside a `oneof` does not track presence: the encoder omits its default value, i.e., 0, `false`, or empty, so the receiver cannot distinguish an omitted field from an explicitly sent default. For example, an omitted `msgDirective.seq` has the value 0.

Fields declared `optional`, message fields, and `oneof` members track presence. The decoder can tell whether such a field was present, even when its value is 0 or `false`. The schema uses `optional` for settings where "not set" means "leave unchanged" and a value means "change it", e.g., `rcp.ptp.fldConfig.enable`. An empty `fldAction.timed` message still selects a timed trigger, and a selected `oneof` member with the value 0 is still encoded.

A `repeated` field stores a list, e.g., one record for each operation of a directive. Repeated numbers are normally packed into a `LEN` record. The protobuf data model does not distinguish an omitted list from an empty list.

## Worked example

In the text format, the directive that queries the identity of the RCP server reads:

```text
seq: 1
dir { query { rcp: qryIdentity } }
```

Its encoded form takes 11 bytes: `0D 01 00 00 00 12 04 1A 02 10 0A`.

| Bytes         | Meaning                                                          |
| :------------ | :--------------------------------------------------------------- |
| `0D`          | Tag of `msgDirective.seq`: field number 1, wire type 5 (`I32`)   |
| `01 00 00 00` | Value of `seq`: 1, as four bytes                                 |
| `12`          | Tag of `msgDirective.dir`: field number 2, wire type 2 (`LEN`)   |
| `04`          | Length of the first operation: 4 bytes                           |
| `1A`          | Tag of `fldOperation.query`: field number 3, wire type 2 (`LEN`) |
| `02`          | Length of the query: 2 bytes                                     |
| `10`          | Tag of `fldQuery.rcp`: field number 2, wire type 0 (`VARINT`)    |
| `0A`          | Value of `fldQuery.rcp`: 10, which is `qryIdentity`              |

The field `fldQuery.hndl` is 0, which addresses the RCP server itself, so it is not written. The maximum size of an encoded message depends on the frame type, see [Network](03_network.md).

