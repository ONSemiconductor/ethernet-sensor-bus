# Ethernet Sensor Bus (ESB)

The Ethernet Sensor Bus (ESB) is an open protocol for controlling hardware endpoints, such as SPI, I2C, GPIO, and UART controllers, over Ethernet. The application software runs on a central processor, the client, and controls the remote RCP servers. The servers contain the endpoints and run no application software, so the application is developed, tested, and updated in one place.

![logo](figures/logoEsbLight.svg)

## Repository structure

```text
protocol/              Protocol Buffers definitions (.proto)
  rcp.proto            Top-level messages: the directive (client to server) and the report (server to client)
  rcp_common.proto     Common definitions that files share
  server/              Core features of the RCP server
  endpoints/           Endpoints accessible over the protocol
figures/               Images of the documentation
introduction/          Introduction to the protocol
```

## Documentation

The protocol documentation consists of two parts:

- The [introduction](introduction) folder contains one Markdown file per topic. Its [readme](introduction/readme.md) provides the overview and serves as the first page of the introduction.
- The comments in the Protocol Buffers definition files (`*.proto`) in the [protocol](protocol) folder describe the individual messages, fields, and endpoints.

The [generated documentation](https://onsemiconductor.github.io/ethernet-sensor-bus/index.html) is available online.

## Contributing

Open an issue to report a problem or to discuss a change. Changes are submitted as pull requests that comply with the following guidelines:

- Keep the schema backward compatible. Do not renumber fields or enumeration values, and do not reuse a number for another purpose. Add new fields, messages, and enumeration values instead, see Compatibility in [Messages](introduction/02_messages.md).
- Document every message, field, and enumeration value with a comment in the `.proto` file. These comments and the Markdown files in the [introduction](introduction) folder are the source of the generated documentation.
- Follow the [conventions](introduction/readme.md) of the documentation, such as the notation of numbers and the use of normative language.
- Format the `.proto` files with `clang-format`. The configuration is in the file [.clang-format](.clang-format).
- Verify that all `.proto` files compile with `protoc`, see [Code generators](introduction/08_generators.md).
