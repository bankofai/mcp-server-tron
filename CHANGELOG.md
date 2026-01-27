# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-27

### Added

- Initial implementation of TRON MCP Server.
- Support for TRX and TRC20 token transfers.
- Smart contract interaction (read/write/multicall).
- Support for `TRONGRID_API_KEY` to handle rate limits.
- BIP-39 mnemonic and HD wallet support.
- Address conversion between Hex and Base58 formats.
- Resource cost queries (Energy/Bandwidth).
- Secure npm publishing via OIDC (OpenID Connect) with provenance.
- Release workflow triggered by GitHub Release events.

### Security

- **Mandatory Confirmation**: Introduced `confirmed` parameter for all write operations (`write_contract`, `transfer_trx`, `transfer_trc20`, `sign_message`). Transactions will not be broadcast without explicit user confirmation.
- **Environment Variable Safety**: Documentation emphasizing the use of environment variables for private keys instead of MCP configuration files.
