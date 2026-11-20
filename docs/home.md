# Ethernet Sensor Bus (ESB)

The Ethernet Sensor Bus (ESB) is a protocol for controlling hardware endpoints, such as SPI, I2C, GPIO, and UART controllers, over Ethernet. The application software runs on a central processor, the client, and controls the remote RCP servers. The servers contain the endpoints and run no application software, so the application is developed, tested, and updated in one place.

The following pages introduce the protocol:

- [Overview](../introduction/readme.md): the motivation, the scope, the conventions, the terms, and the references.
- [Operating principle](../introduction/01_principle.md): the roles of the client and the RCP server, the path of a directive, and the endpoints.
- [Messages](../introduction/02_messages.md): the structure of directives and reports.
- [Network](../introduction/03_network.md): how messages reach an RCP server over Ethernet and, optionally, UDP/IP.
- [Scheduler](../introduction/04_scheduler.md): how an RCP server runs actions at the right time, repeatedly, or on events.
- [Higher-level behavior](../introduction/05_behavior.md): persistent storage and fail-safe operation.
- [Usage hints](../introduction/06_hints.md): recommendations for working with RCP servers.
- [Protobuf encoding](../introduction/07_protobuf.md): how Protocol Buffers turn a message into bytes.
- [Code generators](../introduction/08_generators.md): how to get the encoder and decoder for a programming language.

The remaining pages describe the protocol fields in detail:

- [RCP Messages](../protocol/rcp.proto): the top-level messages and the containers of the operations.
- [Common Definitions](../protocol/rcp_common.proto): the definitions that several files share.
- [Server](../protocol/server/readme.md): the messages for the RCP server itself.
- [Endpoints](../protocol/endpoints/readme.md): one page for each type of endpoint.
