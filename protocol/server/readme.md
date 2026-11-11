# Server

Messages that configure, control, and query the RCP server itself, as opposed to the endpoints that it contains.

The pages group the messages by topic:

- [RCP Server](rcp_dev.proto): the containers of these messages and the commands that manage the server.
- [Identification and Capabilities](rcp_info.proto): the identity, the capabilities, and the list of endpoints.
- [Core Operations](rcp_core.proto): the identification number (DID), the network watchdog, the aggregation of notifications, the scheduler, and the NVM.
- [Pins](rcp_pins.proto): the pins of the server and their assignment to the functions of the endpoints.
- [Network Configuration](rcp_net.proto): the addresses, VLANs, and clients of the server and the access to its PHY.
- [PTP](rcp_ptp.proto): the PTP timer, the time base for timed actions and timestamps.
- [PLCA](rcp_plca.proto): the physical layer collision avoidance (PLCA) of 10BASE-T1S networks.
- [Topology Discovery](rcp_tpd.proto): the signal delays between the nodes of a 10BASE-T1S network.
- [Vendor-Specific Features](rcp_vendor.proto): the settings and the status that are specific to the vendor.

A client reads `rcp.info.fldCapabilities` to find out which optional features a server has.
