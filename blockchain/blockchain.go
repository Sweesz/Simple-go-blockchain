package blockchain

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	g "main/Graph"
	"strings"
	"time"
)

type Block struct {
	Id           int
	Hash         string
	PreviusHash string
	Time         time.Time
	Data         []g.Transaction
}
type BlockChain struct {
	Chain []Block
}

func Generate_hash() string {
	count := 5
	prefix := strings.Repeat("0", count)
	for {
		bytes := make([]byte, 20)
		rand.Read(bytes)
		data := fmt.Sprintf("%d, %x", time.Now().Unix(), bytes)
		byteshash := sha256.Sum256([]byte(data))
		hash := hex.EncodeToString(byteshash[:])
		if hash[:count] == prefix {
			return hash
		}
	}
}
func Create_genesis_block() Block {
	return Block {
		Id:           0,
		Hash:         Generate_hash(),
		PreviusHash: "0",
		Time:         time.Now(),
		Data: []g.Transaction{},
	}
}
func New_blockchain() BlockChain {
	blockchain := BlockChain{}
	blockchain.Chain = append(blockchain.Chain, Create_genesis_block())
	return blockchain
}
