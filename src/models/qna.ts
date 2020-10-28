import {
  AllowNull,
  Unique,
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  Comment,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Default//, ForeignKey
} from "sequelize-typescript";
  
  @Table({ timestamps: true })
export default class QnA extends Model<QnA> {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    id!: number;
  
    @AllowNull(false)
    @Column(DataType.STRING)
    qnaKind!: string;

    @AllowNull(false)
    @Column(DataType.BIGINT)
    userId!: number;
  
    // @AllowNull(true)
    @Column(DataType.TEXT)
    content!:string;
  
    @AllowNull(true)
    @Column(DataType.TEXT)
    answer!:string;  

    @Default(0)
    @Column(DataType.TEXT)
    status!:string;
  
    @CreatedAt
    createdAt!: Date;
  
    @UpdatedAt
    updatedAt!: Date;
  
    @DeletedAt
    deletedAt!: Date;
}
  