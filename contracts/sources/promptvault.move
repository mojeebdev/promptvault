// contracts/promptvault.move
// Minimal Move module for PromptVault on Sui
// Deploy with: sui client publish --gas-budget 100000000

module promptvault::promptvault {
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};

    /// Core on-chain record. Each prompt (and its AI eval) is referenced by Walrus blob IDs.
    public struct PromptRecord has key, store {
        id: UID,
        /// Primary Walrus blob containing {title, prompt, tags, targetModel, createdAt}
        prompt_blob_id: String,
        /// Secondary Walrus blob with the full AI evaluation JSON
        eval_blob_id: String,
        title: String,
        tags: vector<String>,
        target_model: String,
        /// If this was forked, points back to the original prompt's blob ID (provenance)
        parent_blob_id: Option<String>,
        creator: address,
        created_at: u64,
    }

    /// Emitted on every publish so anyone can index the registry without scanning owned objects.
    public struct PromptPublished has copy, drop {
        record_id: ID,
        prompt_blob_id: String,
        title: String,
        creator: address,
        parent_blob_id: Option<String>,
    }

    /// Publish a new (or forked) prompt record to the chain.
    /// The record is transferred to the sender (owned). Discovery happens via events.
    public entry fun publish(
        prompt_blob_id: vector<u8>,
        eval_blob_id: vector<u8>,
        title: vector<u8>,
        tags: vector<vector<u8>>,
        target_model: vector<u8>,
        parent_blob_id: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let record = PromptRecord {
            id: object::new(ctx),
            prompt_blob_id: string::utf8(prompt_blob_id),
            eval_blob_id: string::utf8(eval_blob_id),
            title: string::utf8(title),
            tags: vector::map!(tags, |t| string::utf8(t)),
            target_model: string::utf8(target_model),
            parent_blob_id: if (vector::is_empty(&parent_blob_id)) {
                option::none<String>()
            } else {
                option::some(string::utf8(parent_blob_id))
            },
            creator: sender,
            created_at: tx_context::epoch(ctx),
        };

        let record_id = object::id(&record);

        // Emit for public indexing (feed uses suix_queryEvents)
        sui::event::emit(PromptPublished {
            record_id,
            prompt_blob_id: record.prompt_blob_id,
            title: record.title,
            creator: sender,
            parent_blob_id: record.parent_blob_id,
        });

        // Transfer ownership to publisher. They can later transfer or share if desired.
        transfer::public_transfer(record, sender);
    }

    // Helper views (optional, for on-chain reads if needed)
    public fun prompt_blob_id(self: &PromptRecord): &String { &self.prompt_blob_id }
    public fun eval_blob_id(self: &PromptRecord): &String { &self.eval_blob_id }
    public fun title(self: &PromptRecord): &String { &self.title }
}
