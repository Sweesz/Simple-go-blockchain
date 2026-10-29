package graph

import (
	"time"
	"github.com/google/uuid"
)

type Transaction struct {
	Name      map[uuid.UUID]string `json:"name"`
	Data      string `json:"type"`
	Timestamp time.Time
	PubKey []byte
	Signature []byte
}
type CreateTransaction struct {
	Name      string `json:"name"`
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

