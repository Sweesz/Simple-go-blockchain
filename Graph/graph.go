package graph

import (
	"time"
	"github.com/google/uuid"
)

type Transaction struct {
	From      map[uuid.UUID]string `json:"from"`
	To        map[uuid.UUID]string `json:"to"`
	Data      string `json:"type"`
	Timestamp time.Time
	PubKey []byte
	Signature []byte
}
type CreateTransaction struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Data      string `json:"type"`
	Timestamp time.Time
}
/*type Graph struct {
	Connections map[int][]int
}*/

/*func VerifyTransaction(tx Transaction) bool {
	pubKey, privKey, _ := ed25519.GenerateKey(rand.Reader)
	dataToSign := fmt.Sprintf("%s%s%s%d", tx.From, tx.To, tx.Type, tx.Timestamp.Unix())
	signature := ed25519.Sign(privKey, []byte(dataToSign))
	valid := ed25519.Verify(pubKey, []byte(dataToSign), signature)
	return valid
}*/

